const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route GET /api/users/profile
// @desc Get aggregated profile data for dashboard
router.get('/profile', auth, async (req, res) => {
  try {
    // 1. Get User Data
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // 2. Removed Wallet Data
    
    // 3. Get User's Listed Products
    const listings = await Product.find({ sellerId: user._id }).sort({ createdAt: -1 });
    
    // 4. Get User's Purchases (Orders where they are buyer)
    const purchases = await Order.find({ buyerId: user._id })
                                 .populate('itemId')
                                 .sort({ createdAt: -1 });
    
    // 5. Calculate Stats
    const productsListed = listings.length;
    const productsSold = listings.filter(p => p.status === 'sold').length;
    const productsPurchased = purchases.length;
    
    res.json({
      user,
      listings,
      purchases,
      stats: {
        productsListed,
        productsSold,
        productsPurchased
      }
    });
  } catch (error) {
    console.error('Error fetching profile dashboard:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/users/profile
// @desc Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, college, course, semester, profilePicture } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (college !== undefined) user.college = college;
    if (course !== undefined) user.course = course;
    if (semester !== undefined) user.semester = semester;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
