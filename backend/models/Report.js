const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    task: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
      trim: true
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model('Report', reportSchema);
