const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  task: String,
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'completed'
  }
});

module.exports = mongoose.model('Report', reportSchema);
