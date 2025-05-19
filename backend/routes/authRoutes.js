const express = require('express');
const router = express.Router();

// Controllers
const {
  registerUser,
  loginUser,
  updateProfile,
  getProfile
} = require('../controllers/authController');

// Multer middleware for image upload
const upload = require('../middlewares/upload.js');

// Register new user
router.post('/register', registerUser);

// Login existing user
router.post('/login', loginUser);

// Get user profile by ID
router.get('/profile/:id', getProfile);

// Update user profile with image upload
router.put('/update-profile/:id', upload.single('profileImage'), updateProfile);

module.exports = router;
