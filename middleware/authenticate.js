const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token
        console.log("deocde:", decoded)

        // Optionally, check if user exists in the database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Attach token data to the request for downstream use
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
        };

        next(); // Proceed
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticate;
