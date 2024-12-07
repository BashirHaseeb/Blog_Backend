// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://bashir:bashir@cluster0.5fx4u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/signup');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;