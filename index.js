const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require("./config/db");
const userR = require('./Routes/User')


const app = express();
const PORT = 5000;

// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());

connectDB();

app.use('/user', userR)
app.get("/", (req, res) => {
    res.status(200).json({ message: "Done" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
