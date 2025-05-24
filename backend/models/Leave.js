// models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  name: String,
  employeeId: String,
  phone: String,
  reason: String,
  date: Date,
  document: String, // must be included
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
