const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('./middleware/authenticate');
const adminCheck = require('./middleware/adminCheck');
const app = express();
const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://bashir:bashir@cluster0.5fx4u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/signup')
    .then(() => { console.log("DB connected"); })
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit on error
    });

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Login successful.', token, user: { email: user.email, name: user.name } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// User signup route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a user (admin-only)
app.delete('/api/admin/users/:id', adminCheck, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Route to update user details (admin-only)
app.put('/api/admin/users/:id', adminCheck, async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        const updatedUser = await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Route to get all users (admin-only)
app.get('/api/admin/users', authenticate, async (_req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Route to get logged-in user's personal info
app.get('/api/admin/me', authenticate, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Error fetching personal info:', error);
        res.status(500).json({ message: 'Failed to fetch personal information.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
