// controllers/authController.js
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
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
    const { username, password, role } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        if (user.role !== role) {
            return res.status(403).json({ message: 'Incorrect role selected' });
        }

        res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

