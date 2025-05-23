const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// POST /api/reports - submit a report
router.post('/', async (req, res) => {
  try {
    const { date, task, status, employeeId } = req.body;
    if (!employeeId || !date || !task || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Convert date string to Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const report = new Report({
      employeeId: employeeId.trim(),
      date: parsedDate,
      task: task.trim(),
      status: status.trim()
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/my?employeeId=xxx&month=2025-04
router.get('/my', async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    if (!employeeId || !month) {
      return res.status(400).json({ error: 'Missing employeeId or month' });
    }

    // Validate month format YYYY-MM with simple regex
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // move to first day of next month

    const reports = await Report.find({
      employeeId: employeeId.trim(),
      date: { $gte: start, $lt: end }
    }).sort({ date: 1 });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
