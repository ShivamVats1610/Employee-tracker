const Leave = require('../models/Leave');

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { name, employeeId, phone, reason, date } = req.body;
    const document = req.file
  ? `${req.protocol}://${req.get('host')}/uploads/leaveDocs/${req.file.filename}`
  : null;

    const newLeave = new Leave({
      name,
      employeeId,
      phone,
      reason,
      date,
      document,
      status: 'Pending' // default status when applying
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave applied successfully', leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: 'Error applying leave', error: error.message || error });
  }
};

// Get leave requests for an employee
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const leaves = await Leave.find({ employeeId });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message || error });
  }
};

// Get all leave requests (for HR)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all leave requests', error: error.message || error });
  }
};

// Approve leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.json({ message: 'Leave approved', leave });
  } catch (error) {
    res.status(500).json({ message: 'Error approving leave', error: error.message || error });
  }
};

// Reject leave
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.json({ message: 'Leave rejected', leave });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting leave', error: error.message || error });
  }
};
