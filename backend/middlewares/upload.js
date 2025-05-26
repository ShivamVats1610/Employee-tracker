const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory to store uploaded profile images
const uploadDir = path.join(__dirname, '..', 'uploads', 'profileImages');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
  } catch (err) {
    console.error('Error creating upload directory:', err);
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
};

// Create the multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

module.exports = upload;
