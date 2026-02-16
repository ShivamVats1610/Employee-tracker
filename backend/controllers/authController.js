const User = require('../models/User.js');
const bcrypt = require('bcryptjs');


/* =====================================================
   REGISTER USER
===================================================== */
exports.registerUser = async (req, res) => {
  try {
    let { id, username, password, role } = req.body;

    // Validate required fields
    if (!id || !username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check username exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // Check employee ID exists
    const existingId = await User.findOne({ id });
    if (existingId)
      return res.status(400).json({ message: 'ID already exists. Try again.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize role safely
    role = role.toString().trim().toLowerCase();

    if (role === 'hr') role = 'HR';
    else if (role === 'admin') role = 'Admin';
    else if (role === 'employee') role = 'Employee';
    else return res.status(400).json({ message: 'Invalid role provided' });

    // Save user
    const newUser = new User({
      id,
      username,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error("🔥 FULL REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
}
};


/* =====================================================
   LOGIN USER
===================================================== */
exports.loginUser = async (req, res) => {
  try {
    let { username, password, role } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    // Normalize role safely
    role = role.toString().trim().toLowerCase();

    if (role === 'hr') role = 'HR';
    else if (role === 'admin') role = 'Admin';
    else if (role === 'employee') role = 'Employee';
    else return res.status(400).json({ message: 'Invalid role provided' });

    // Role check
    if (user.role !== role) {
      return res.status(403).json({ message: 'Incorrect role selected' });
    }

    res.status(200).json({
      message: 'Login successful',
      user
    });

  } catch (error) {
    console.error("🔥 FULL LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
}
};


/* =====================================================
   UPDATE PROFILE
===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, age } = req.body;

    const profileImage = req.file ? `profileImages/${req.file.filename}` : null;

    const updatedFields = { name, age };
    if (profileImage) updatedFields.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   GET PROFILE
===================================================== */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const userObj = user.toObject();

    // Dynamic base URL (works local + production)
    if (userObj.profileImage) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      userObj.profileImage = `${baseUrl}/api/uploads/${userObj.profileImage}`;
    }

    res.json(userObj);

  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
