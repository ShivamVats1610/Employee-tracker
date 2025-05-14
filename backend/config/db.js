const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ritishrakhraimcl:ritish%40123@ritishcluster.e2rh7z3.mongodb.net/employeetracker?retryWrites=true&w=majority')
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.log('Failed to connect:', error);
    }
};

module.exports = connectDB;
