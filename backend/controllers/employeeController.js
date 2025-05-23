const User = require('../models/User');

// GET /api/employees - fetch all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const users = await User.find({ role: 'Employee' }, 'username role'); // Only fetch needed fields
    const employees = users.map(user => ({
      ...user.toObject(),
      workingDays: 0, // Replace with actual logic later
      leaveDays: 0    // Replace with actual logic later
    }));
    res.json(employees);
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
};

// DELETE /api/employees/:username - delete employee by username
exports.deleteEmployee = async (req, res) => {
  const { username } = req.params;
  try {
    const deleted = await User.findOneAndDelete({ username });
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};
