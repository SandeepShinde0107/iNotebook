const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/inotebook';

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
