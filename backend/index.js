const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// upload profile image
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));

// Checkin/Checkout routes
app.post('/api/checkin', (req, res) => {
  console.log('Employee checked-in.');
  res.send({ message: 'Check-in successful!' });
});

app.post('/api/checkout', (req, res) => {
  console.log('Employee checked-out.');
  res.send({ message: 'Check-out successful!' });
});

// manage employees
const employeeRoutes = require('./routes/employeeRoutes');

app.use('/api/employees', employeeRoutes);

// leave management
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

//reports management
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
// Start Server
app.listen(8082, () => {
  console.log('server is running on port 8082');
});
