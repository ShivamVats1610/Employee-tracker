const express = require('express');
const router = express.Router();
const multer = require('multer');
const haversine = require('haversine-distance');
const path = require('path');
const fs = require('fs').promises;
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Multer setup for check-in image upload
const checkinStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'checkinFaces');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ storage: checkinStorage, fileFilter });

// Office coordinates (Delhi example)
const officeLocation = {
  latitude: 30.677056,
  longitude: 76.748139,
};

// Dummy Face Verification Function
async function verifyFace(profileImagePath, uploadedImagePath) {
  // Placeholder for actual face verification logic
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

// Authentication Middleware Stub
function ensureAuthenticated(req, res, next) {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
  }
  next();
}

// Validate latitude & longitude ranges
function isValidCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

// POST /checkin
router.post('/check-in', ensureAuthenticated, upload.single('faceImage'), async (req, res) => {

  console.log("hello")
  try {
    const { latitude, longitude } = req.body;

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ message: 'Valid location coordinates are required.' });
    }

    const userLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const distance = haversine(officeLocation, userLocation);
    if (distance > 100) {
      return res.status(403).json({ message: 'You must be in the office area to check in.' });
    }

    const employeeId = req.user._id;
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.profileImage) {
      return res.status(404).json({ message: 'User profile image not found for face verification.' });
    }

    const profileImageFilename = path.basename(user.profileImage);
    const profileImagePath = path.join(__dirname, '..', 'uploads', 'profileImages', profileImageFilename);

    try {
      await fs.access(profileImagePath);
    } catch {
      return res.status(404).json({ message: 'Stored profile image file does not exist.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Face image is required for verification.' });
    }

    const uploadedImagePath = req.file.path;
    const faceVerificationSuccess = await verifyFace(profileImagePath, uploadedImagePath);
    if (!faceVerificationSuccess) {
      await fs.unlink(uploadedImagePath).catch(() => {});
      return res.status(401).json({ message: 'Face verification failed.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: todayStart,
      status: 'checked-in',
    });

    if (existingAttendance) {
      await fs.unlink(uploadedImagePath).catch(() => {});
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    const attendance = new Attendance({
      employeeId,
      date: todayStart,
      status: 'checked-in',
      faceImagePath: uploadedImagePath,
      checkInTime: new Date(),
    });

    await attendance.save();
    return res.status(200).json({ message: 'Checked in successfully.' });

  } catch (error) {
    console.error('Check-in error:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error during check-in.' });
  }
});

// POST /checkout
router.post('/check-out', ensureAuthenticated, async (req, res) => {
  try {
    const employeeId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Find active check-in attendance for today without checkOutTime
    const attendance = await Attendance.findOne({
      employeeId,
      date: todayStart,
      status: 'checked-in',
      checkOutTime: { $exists: false },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in record found for today.' });
    }

    attendance.status = 'checked-out';
    attendance.checkOutTime = new Date();

    await attendance.save();
    return res.status(200).json({ message: 'Checked out successfully.' });

  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ message: 'Server error during check-out.' });
  }
});

module.exports = router;
