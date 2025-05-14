const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
// require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));

// checkincheckout
app.post('/api/checkin', (req, res) => {
  // Handle the check-in process
  console.log('Employee checked-in.');
  // Save check-in status to your database if needed
  res.send({ message: 'Check-in successful!' });
});

app.post('/api/checkout', (req, res) => {
  // Handle the check-out process
  console.log('Employee checked-out.');
  // Save check-out status to your database if needed
  res.send({ message: 'Check-out successful!' });
});

// Start Server
app.listen(8082,()=>{
  console.log('server is running on port 8082');
})

