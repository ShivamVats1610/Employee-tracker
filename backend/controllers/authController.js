    // controllers/authController.js
    const User = require('../models/User.js');
    const bcrypt = require('bcryptjs');

    exports.registerUser = async (req, res) => {
    let { id, username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

        const existingId = await User.findOne({ id });
        if (existingId)
            return res.status(400).json({ message: 'ID already exists. Try again.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const allowedRoles = ['HR', 'Admin', 'Employee'];
        role = role.trim().toLowerCase();
        if (role === 'hr') role = 'HR';
        else if (role === 'admin') role = 'Admin';
        else if (role === 'employee') role = 'Employee';
        else return res.status(400).json({ message: 'Invalid role provided' });

        const newUser = new User({
            id,
            username,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



    exports.loginUser = async (req, res) => {
        let { username, password, role } = req.body;

        try {
            const user = await User.findOne({ username });
            if (!user) return res.status(400).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

            // Normalize the role from the request
            role = role.trim().toLowerCase();
            if (role === 'hr') role = 'HR';
            else if (role === 'admin') role = 'Admin';
            else if (role === 'employee') role = 'Employee';
            else return res.status(400).json({ message: 'Invalid role provided' });

            // Check if the normalized role matches
            if (user.role !== role) {
                return res.status(403).json({ message: 'Incorrect role selected' });
            }

            res.status(200).json({ message: 'Login successful', user });

        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    };

    exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, age } = req.body;

    const profileImage = req.file ? `profileImages/${req.file.filename}` : null;

    const updatedFields = { name, age };
    if (profileImage) {
      updatedFields.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};


    // GET profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Append full URL for image if it exists
    const userObj = user.toObject();
    if (userObj.profileImage) {
      userObj.profileImage = `http://localhost:8082/api/uploads/${userObj.profileImage}`;
    }

    res.json(userObj);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
