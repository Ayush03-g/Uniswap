const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// @route POST /api/auth/register
// @desc Register user directly without OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!email.endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ message: 'Registration is restricted to @medicaps.ac.in email addresses.' });
    }

    if (!/^[A-Z]/.test(password) || password.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.' });
    }

    // Validate if user already exists
    let existingUser = await User.findOne({ 
      $or: [
        { email },
        { phoneNumber: mobile }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'This email is already associated with an account.' });
      }
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create User
    const maleSeeds = ["Felix", "Jack", "Oliver", "Max", "Leo", "Sam", "Jasper", "Finn", "Oscar", "Lucas"];
    const randomSeed = maleSeeds[Math.floor(Math.random() * maleSeeds.length)];
    const defaultProfilePicture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: true, // Auto-verified since OTP is removed
      phoneNumber: mobile,
      phoneVerified: true, 
      profilePicture: defaultProfilePicture
    });
    
    await newUser.save();
    
    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({ 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      message: 'Registration successful.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ message: `Your account has been ${user.status.toLowerCase()}. Please contact support.` });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campus: user.college,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ========================================================
// ADMIN LOGIN
// ========================================================
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Access Denied. This portal is only for administrators.' });
    }
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access Denied. This portal is only for administrators.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// @route GET /api/auth/users/:id
// @desc Get public user info
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v -email -phoneNumber');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;