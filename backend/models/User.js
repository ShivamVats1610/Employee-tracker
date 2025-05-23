const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      id: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['HR', 'Admin', 'Employee'],
        required: true
    },
    name: {
        type: String,
        default: ""
    },
    age: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String, // filename of the uploaded image
        default: ""
    }
});

module.exports = mongoose.model('User', userSchema);
