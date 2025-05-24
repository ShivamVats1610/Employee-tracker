const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Serve profile images (under /api/uploads)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve document images (under /uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));

// Attendance routes (Check-in / Check-out)
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

// Employee management routes
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Leave management routes
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

// Reports routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Default route to check server status
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Optional global error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Server Error' });
// });

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
