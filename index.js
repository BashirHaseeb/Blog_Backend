const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const userR = require('./Routes/User')


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

app.use('/user', userR)

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
