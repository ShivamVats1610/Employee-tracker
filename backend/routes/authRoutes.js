const express = require('express');
const router = express.Router();

const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const upload = require('../middlewares/upload.js'); // <-- Import your multer middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile update route with upload middleware
router.put('/update-profile/:id', upload.single('profileImage'), updateProfile);

module.exports = router;
