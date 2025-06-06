// routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const uploadLeaveDocs = require('../middlewares/uploadLeaveDocs');
const Leave = require('../models/Leave');

// Apply for leave
router.post('/apply', uploadLeaveDocs.single('document'), async (req, res) => {
  try {
    const { name, employeeId, phone, reason, date } = req.body;
    const document = req.file ? req.file.filename : null;

    const leave = new Leave({
      name,
      employeeId,
      phone,
      reason,
      date,
      document,
      status: 'Pending'
    });

    await leave.save();
    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({ error: 'Error applying leave' });
  }
});

// Get all leave requests by employee
router.get('/apply/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId }).sort({ date: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
});

// Get all pending leave requests (for HR)
router.get('/requests', async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' }).sort({ date: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
});

// Approve leave
router.post('/approve/:id', async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.json({ message: 'Leave approved' });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ error: 'Error approving leave' });
  }
});

// Reject leave
router.post('/reject/:id', async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
    res.json({ message: 'Leave rejected' });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({ error: 'Error rejecting leave' });
  }
});

module.exports = router;
