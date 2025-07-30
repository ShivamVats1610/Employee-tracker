const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

// Multer setup for file upload (image stored as buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mongoose schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true },   // 'YYYY-MM-DD'
  time: { type: String, required: true },   // 'HH:mm:ss'
  action: { type: String, enum: ['Check In', 'Check Out'], required: true },
  location: {
    lat: Number,
    lng: Number,
  },
  image: Buffer,
  imageType: String,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// POST /api/attendance/log - log check in/out
router.post('/log', upload.single('image'), async (req, res) => {
  try {
    const { empid, employeeId, date, time, action, location } = req.body;
    const finalEmpId = employeeId || empid;

    if (!finalEmpId || !date || !time || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const attendanceData = {
      employeeId: finalEmpId,
      date,
      time,
      action,
    };

    // Parse location JSON string if present
    if (location) {
      try {
        attendanceData.location = JSON.parse(location);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid location format' });
      }
    }

    // Attach image if uploaded
    if (req.file) {
      attendanceData.image = req.file.buffer;
      attendanceData.imageType = req.file.mimetype;
    }

    const record = new Attendance(attendanceData);
    await record.save();

    res.json({ message: 'Attendance logged successfully' });
  } catch (err) {
    console.error('Error saving attendance:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to log attendance' });
  }
});

// GET /api/attendance/summary?employeeId=123&month=6
router.get('/summary', async (req, res) => {
  try {
    const { employeeId, empid, month } = req.query;
    const finalEmpId = employeeId || empid;

    if (!finalEmpId || !month) {
      return res.status(400).json({ error: 'Missing employeeId or month' });
    }

    const year = new Date().getFullYear();
    const monthStr = month.toString().padStart(2, '0');
    const regex = new RegExp(`^${year}-${monthStr}`);

    const records = await Attendance.find({
      employeeId: finalEmpId,
      date: { $regex: regex },
    });

    const checkInDates = new Set(records.filter(r => r.action === 'Check In').map(r => r.date));
    const checkOutDates = new Set(records.filter(r => r.action === 'Check Out').map(r => r.date));

    const workingDays = [...checkInDates].filter(date => checkOutDates.has(date)).length;
    const totalDays = new Date(year, parseInt(month), 0).getDate();

    res.json({
      currentMonthLeaves: totalDays - workingDays,
      totalLeaves: totalDays - workingDays,
      workingDaysThisMonth: workingDays,
    });
  } catch (err) {
    console.error('Error fetching summary:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});
router.get('/status', async (req, res) => {
  const { employeeId, empid, date } = req.query;
  const finalEmpId = employeeId || empid;

  try {
    const logs = await Attendance.find({
      employeeId: finalEmpId,
      date: date || new Date().toISOString().slice(0, 10),
    });

    const checkedIn = logs.some(log => log.action === 'Check In');
    const checkedOut = logs.some(log => log.action === 'Check Out');

    const checkInLog = logs.find(log => log.action === 'Check In');
    const checkOutLog = logs.find(log => log.action === 'Check Out');

    res.json({
      checkedIn,
      checkedOut,
      checkInTime: checkInLog?.time || null,
      checkOutTime: checkOutLog?.time || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching status' });
  }
});




module.exports = router;
