const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  checkInTime: { type: String },
  checkOutTime: { type: String },
  location: {
    lat: Number,
    lng: Number
  }
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
