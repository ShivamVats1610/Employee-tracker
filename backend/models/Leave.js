const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  phone: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  document: { type: String }, // filename or path
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
