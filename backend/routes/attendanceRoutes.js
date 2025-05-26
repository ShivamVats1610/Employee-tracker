const express = require('express');
const router = express.Router();
const multer = require('multer');
const haversine = require('haversine-distance');
const path = require('path');
const fs = require('fs').promises;
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Office coordinates (example: Chandigarh IT Park)
const officeLocation = {
  latitude: 30.677056,
  longitude: 76.748139,
};

// Directory for check-in face images
const checkinDir = path.join(__dirname, '..', 'uploads', 'checkinFaces');

// Multer storage config
const checkinStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(checkinDir, { recursive: true });
      cb(null, checkinDir);
    } catch (err) {
      cb(new Error('Failed to create upload directory.'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif).'));
  }
};

const upload = multer({
  storage: checkinStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Dummy face verification function (replace with your real verification)
async function verifyFace(profileImagePath, uploadedImagePath) {
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return true; // Always passes for now
}

// Helper to validate coordinates
function isValidCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// POST /check-in
router.post('/check-in', upload.single('faceImage'), async (req, res) => {
  try {
    const { latitude, longitude, employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required.' });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ message: 'Valid location coordinates are required.' });
    }

    const userLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // Check if user is inside allowed office area (within 100m)
    const distance = haversine(officeLocation, userLocation);
    if (distance > 100) {
      return res.status(403).json({ message: 'You must be in the office area to check in.' });
    }

    // Find user in DB
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.profileImage) {
      return res.status(404).json({ message: 'No profile image found for face verification.' });
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

    // Verify face - replace this with your real face recognition logic
    const faceVerified = await verifyFace(profileImagePath, uploadedImagePath);
    if (!faceVerified) {
      await fs.unlink(uploadedImagePath).catch(() => {});
      return res.status(401).json({ message: 'Face verification failed.' });
    }

    // Check if already checked in today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyCheckedIn = await Attendance.findOne({
      employeeId,
      date: todayStart,
      status: 'checked-in',
    });

    if (alreadyCheckedIn) {
      await fs.unlink(uploadedImagePath).catch(() => {});
      return res.status(400).json({ message: 'Already checked in today.' });
    }

    // Save attendance record
    const attendance = new Attendance({
      employeeId,
      date: todayStart,
      status: 'checked-in',
      faceImagePath: uploadedImagePath,
      checkInTime: new Date(),
    });

    await attendance.save();

    res.status(200).json({ message: 'Checked in successfully.' });
  } catch (err) {
    console.error('Check-in error:', err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during check-in.' });
  }
});

// POST /check-out
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

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

    res.status(200).json({ message: 'Checked out successfully.' });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ message: 'Server error during check-out.' });
  }
});

module.exports = router;
