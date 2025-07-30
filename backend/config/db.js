
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.log('Failed to connect:', error);
    }
};

module.exports = connectDB;
