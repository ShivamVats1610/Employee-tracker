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

// Start Server
app.listen(8082,()=>{
  console.log('server is running on port 8082');
})

