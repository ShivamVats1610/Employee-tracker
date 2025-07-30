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

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const report = new Report({
      employeeId: employeeId.trim(),
      date: parsedDate,
      task: task.trim(),
      status: status.trim().toLowerCase()
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/my?employeeId=xxx&month=YYYY-MM
router.get('/my', async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    if (!employeeId || !month) {
      return res.status(400).json({ error: 'Missing employeeId or month' });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

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

// GET /api/reports/summary?employeeId=xxx&month=YYYY-MM
router.get('/summary', async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    if (!employeeId || !month) {
      return res.status(400).json({ error: 'Missing employeeId or month' });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const summary = await Report.aggregate([
      {
        $match: {
          employeeId: employeeId.trim(),
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      completed: 0,
      pending: 0
    };

    summary.forEach(item => {
      const key = item._id.toLowerCase();
      if (counts.hasOwnProperty(key)) {
        counts[key] = item.count;
      }
    });

    res.json(counts);
  } catch (error) {
    console.error('Error fetching task summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
