const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminCheck = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        console.log("adminCheck:", token)
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = user; // Add user info to request
        next();

    } catch (error) {
        console.error('Admin check error:', error);
        res.status(401).json({ message: 'Invalid token or user (in Amin check)' });
    }
};

module.exports = adminCheck;
