const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = require('multer');

// Middleware
const allowedOrigins = [
  "https://employee-tracker-frontend-eight.vercel.app/", // frontend URL on Vercel
  "http://localhost:3000"                     // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Serve static image/document directories
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== Routes ====================
// Auth
app.use('/api/auth', require('./routes/authRoutes.js'));

// Attendance (Face check-in/out)
const attendanceRoutes = require('./routes/attendanceRoutes.js');
app.use('/api/attendance', attendanceRoutes);

// Employee Management
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Leave Management
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

// Reports
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Test API health
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Optional Global Error Handler (Uncomment if needed)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Server Error' });
// });

// Start Server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
