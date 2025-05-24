const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    required: true,
  },
  faceImagePath: {
    type: String,
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
