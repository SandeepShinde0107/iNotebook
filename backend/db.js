require('dotenv').config();
const mongoose = require('mongoose');

// Use a properly encoded MongoDB connection string
const mongoURI = process.env.MONGO_URL;
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI); // No options needed in newer versions
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1); // Exit the process if unable to connect
    }
};

module.exports = connectToMongo;
