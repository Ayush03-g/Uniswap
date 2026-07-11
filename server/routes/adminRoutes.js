const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const PurchaseRequest = require('../models/PurchaseRequest');
const Order = require('../models/Order');

const Setting = require('../models/Setting');
const Note = require('../models/Note');

const { io, connectedUsers } = require('../server');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

// =====================================
// ANALYTICS
// =====================================
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    
    const activeListings = await Product.countDocuments({ status: 'active' });
    const soldListings = await Product.countDocuments({ status: 'sold' });
    
    const pendingReports = await Report.countDocuments({ status: 'Open' });
    
    const totalNotes = await Note.countDocuments();
    const bannedUsers = await User.countDocuments({ status: 'BANNED' });
    
    const totalChats = await Conversation.countDocuments();
    const productsListedToday = await Product.countDocuments({ createdAt: { $gte: today } });
    
    let totalNotifications = 0;
    try { totalNotifications = await Notification.countDocuments(); } catch(e){}

    let totalSupportTickets = pendingReports;

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const newProductsLast5Days = await Product.countDocuments({ createdAt: { $gte: fiveDaysAgo } });

    res.json({
      totalUsers,
      bannedUsers,
      totalProducts,
      newUsersToday,
      activeListings,
      soldListings,
      pendingReports,
      totalNotes,
      totalChats,
      productsListedToday,
      newProductsLast5Days,
      totalNotifications,
      totalSupportTickets,
      totalReports: pendingReports // or total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// USERS
// =====================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Product.deleteMany({ sellerId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// PRODUCTS
// =====================================
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// CHATS & NOTIFICATIONS
// =====================================
router.get('/chats', async (req, res) => {
  try {
    const chats = await Conversation.find().populate('participants', 'name email profilePicture').populate('productId', 'title price images').sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/chats/:id', async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notes = await Notification.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// SUPPORT TICKETS
// =====================================
router.get('/support', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/support/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/support/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// NOTES
// =====================================
router.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notes/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const note = await Note.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// NOTIFICATIONS (Admin)
// =====================================
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, recipients } = req.body;
    let targetUsers = [];
    
    if (recipients === 'ALL') {
      targetUsers = await User.find({ status: 'ACTIVE' });
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      targetUsers = await User.find({ _id: { $in: recipients }, status: 'ACTIVE' });
    } else if (typeof recipients === 'string') {
      targetUsers = await User.find({ _id: recipients, status: 'ACTIVE' });
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({ message: 'No valid recipients found.' });
    }
    
    const notifications = targetUsers.map(user => ({
      userId: user._id,
      type: 'admin_message',
      title: title || 'Admin Notification',
      message,
      sender: 'Admin'
    }));
    
    const insertedNotifications = await Notification.insertMany(notifications);

    // Emit to online users
    insertedNotifications.forEach(notification => {
      const socketId = connectedUsers.get(notification.userId.toString());
      if (socketId) {
        io.to(socketId).emit('new_notification', notification);
      }
    });

    res.json({ message: 'Notification sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================
// SETTINGS
// =====================================
router.get('/settings', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting(req.body);
      await setting.save();
    } else {
      setting = await Setting.findOneAndUpdate({}, req.body, { new: true });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
