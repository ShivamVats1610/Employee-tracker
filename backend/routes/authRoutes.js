const express = require('express');
const router = express.Router();

const { registerUser, loginUser, updateProfile,getProfile } = require('../controllers/authController');
const upload = require('../middlewares/upload.js'); // <-- Import your multer middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile update route with upload middleware
router.put('/update-profile/:id', upload.single('profileImage'), updateProfile);
router.get('/profile/:id',getProfile);


module.exports = router;
