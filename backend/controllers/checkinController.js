const path = require('path');
const fs = require('fs');
const haversine = require('haversine-distance');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const faceVerificationService = require('../services/faceVerificationService');

// Office location (example: Delhi)
const officeLocation = {
  latitude: 30.677056,
  longitude: 76.748139,
};

exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const employeeId = req.user && req.user._id;

    if (!employeeId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Face image is required for verification.' });
    }

    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.profileImage) {
      return res.status(404).json({ message: 'User profile image not found for face verification.' });
    }

    const profileImagePath = path.join(__dirname, '..', 'uploads', 'profileImages', user.profileImage);
    if (!fs.existsSync(profileImagePath)) {
      return res.status(404).json({ message: 'Stored profile image file does not exist.' });
    }

    const uploadedImagePath = req.file.path;

    // Face verification could throw errors, so wrap it in try-catch if needed
    const isFaceVerified = await faceVerificationService.verify(profileImagePath, uploadedImagePath);
    if (!isFaceVerified) {
      return res.status(401).json({ message: 'Face verification failed.' });
    }

    const userLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    const distance = haversine(officeLocation, userLocation);
    if (distance > 100) {  // distance in meters
      return res.status(403).json({ message: 'You must be in the office area to check in.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId,
      status: 'checked-in',
      checkInTime: { $gte: todayStart }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    const attendance = new Attendance({
      employeeId,
      status: 'checked-in',
      faceImagePath: uploadedImagePath,
      checkInTime: new Date(),
    });

    await attendance.save();

    return res.status(200).json({ message: 'Checked in successfully.' });

  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Internal server error during check-in.' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user && req.user._id;

    if (!employeeId) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      status: 'checked-in',
      checkInTime: { $gte: todayStart },
      checkOutTime: { $exists: false }
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
    return res.status(500).json({ message: 'Internal server error during check-out.' });
  }
};
