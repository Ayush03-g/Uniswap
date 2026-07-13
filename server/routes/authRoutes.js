const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
// In-memory rate limiting for send-otp: 5 requests per hour per email (simplified)
const rateLimitMap = new Map();

const otpLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  const isDev = process.env.NODE_ENV === 'development';
  const windowMs = isDev ? 60 * 1000 : 60 * 60 * 1000; // 1 minute in dev, 1 hour in prod
  const maxRequests = isDev ? 100 : 5; // 100 in dev, 5 in prod

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return next();
  }

  const record = rateLimitMap.get(ip);
  if (now - record.firstRequest > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many OTP requests. Please try again later.' 
    });
  }

  record.count += 1;
  next();
};

const transporter = require('../config/smtp');

const getEmailTemplate = (otp, type) => {
  const title = type === 'register' ? 'Verify Your Account' : 'Reset Your Password';
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #6a1b9a; text-align: center;">${title}</h2>
        <p style="font-size: 16px; color: #333333;">Hello,</p>
        <p style="font-size: 16px; color: #333333;">Please use the following OTP to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #6a1b9a; padding: 10px 20px; border: 2px dashed #6a1b9a; border-radius: 4px; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666666; text-align: center;">This OTP is valid for <strong>10 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999999; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
};

// @route POST /api/auth/send-otp
// @desc Send OTP to email
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required.' });
    }
    
    if (!email.endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ message: 'Only Medi-Caps University email addresses (@medicaps.ac.in) are allowed.' });
    }

    if (!['register', 'reset'].includes(type)) {
      return res.status(400).json({ message: 'Invalid OTP type.' });
    }

    // If type is reset, ensure user exists
    if (type === 'reset') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email address.' });
      }
    } else if (type === 'register') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already associated with an account.' });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    
    // Delete existing OTPs for this email to avoid duplicates/confusion
    await Otp.deleteMany({ email });

    const newOtp = new Otp({
      email,
      hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0
    });
    await newOtp.save();
    
    // Send Email
    const mailOptions = {
      from: `"UniSwap" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'UniSwap OTP Verification',
      html: getEmailTemplate(otp, type)
    };

    let info;
    try {
      console.log(`\n=========================================`);
      if (req.body.isResend) {
        console.log("Resend OTP requested");
      } else {
        console.log("OTP requested");
      }
      console.log(`[SMTP] Host: ${process.env.SMTP_HOST}`);
      console.log(`[SMTP] Port: ${process.env.SMTP_PORT}`);
      console.log(`[SMTP] Sender: ${process.env.EMAIL_FROM}`);
      console.log(`[SMTP] Recipient: ${email}`);
      console.log("OTP:", otp);
      console.log(`Sending email`);
      info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully`);
      console.log(`=========================================\n`);
    } catch (emailError) {
      console.error('\n❌ CRITICAL: Failed to send OTP email.');
      console.error('Stack Trace:', emailError.stack || emailError);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
    }
    
    res.status(200).json({ 
      message: 'OTP sent successfully to email.'
    });
  } catch (error) {
    console.error('\n❌ Server error in send-otp:');
    console.error('Stack Trace:', error.stack || error);
    res.status(500).json({ message: 'Server error in sending OTP' });
  }
});

// @route POST /api/auth/verify-otp
// @desc Verify an OTP standalone
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Maximum OTP attempts reached. Please request a new OTP.' });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpDoc.hashedOtp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Delete the OTP record on successful verification to prevent reuse
    await Otp.deleteOne({ _id: otpDoc._id });

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('\n❌ Server error in verify-otp:');
    console.error('Stack Trace:', error.stack || error);
    res.status(500).json({ message: 'Server error in verifying OTP' });
  }
});

// @route POST /api/auth/register
// @desc Register user with OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, otp } = req.body;
    
    if (!name || !email || !password || !mobile || !otp) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!email.endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ message: 'Only Medi-Caps University email addresses (@medicaps.ac.in) are allowed.' });
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

    // Verify OTP
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Maximum OTP attempts reached. Please request a new OTP.' });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.hashedOtp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP is valid
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
      emailVerified: true,
      phoneNumber: mobile,
      phoneVerified: true, // Mimicking old behaviour where registration bypassed explicit mobile verification in new flow
      profilePicture: defaultProfilePicture
    });
    
    await newUser.save();
    
    // Delete OTP
    await Otp.deleteOne({ _id: otpDoc._id });
    
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

// @route POST /api/auth/reset-password
// @desc Reset user's password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!email.endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ message: 'Only Medi-Caps University email addresses (@medicaps.ac.in) are allowed.' });
    }

    if (!/^[A-Z]/.test(newPassword) || newPassword.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Verify OTP
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Maximum OTP attempts reached. Please request a new OTP.' });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.hashedOtp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    // Delete OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    res.json({ message: 'Password updated successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (!email.endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ message: 'Only Medi-Caps University email addresses (@medicaps.ac.in) are allowed.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
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