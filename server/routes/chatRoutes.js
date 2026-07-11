const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

// GET all conversations for a user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ buyerId: req.user.userId }, { sellerId: req.user.userId }]
    }).populate('buyerId', 'name email').populate('sellerId', 'name email').populate('productId', 'title images price category condition').sort('-lastMessageTime');
    
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// @route POST /api/chat/direct
// @desc Create or get a direct conversation with another user
router.post('/direct', auth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId || receiverId === req.user.userId) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    let conversation = await Conversation.findOne({
      type: 'DIRECT_CHAT',
      $or: [
        { buyerId: req.user.userId, sellerId: receiverId },
        { buyerId: receiverId, sellerId: req.user.userId }
      ]
    });

    let isNew = false;
    if (!conversation) {
      conversation = new Conversation({
        buyerId: req.user.userId,
        sellerId: receiverId,
        type: 'DIRECT_CHAT',
        lastMessage: "👋 Hello! I'd like to connect with you through UniSwap.",
        lastMessageTime: Date.now(),
        unreadCount: 1
      });
      await conversation.save();
      isNew = true;

      const msg = new Message({
        conversationId: conversation._id,
        senderId: req.user.userId,
        text: "👋 Hello! I'd like to connect with you through UniSwap.",
      });
      await msg.save();
      
      const User = require('../models/User');
      const sender = await User.findById(req.user.userId);
      
      const Notification = require('../models/Notification');
      const notif = new Notification({
         userId: receiverId,
         type: 'message',
         title: '💬 New Message',
         message: `${sender?.name || 'Someone'} started a conversation with you.`,
         read: false
      });
      await notif.save();
    }

    res.status(200).json({ conversationId: conversation._id, isNew });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET messages for a specific conversation
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    // Check if user is participant
    if (conversation.buyerId.toString() !== req.user.userId && conversation.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('productId', 'title images price category condition')
      .sort('createdAt');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// POST a new message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    
    const conversation = await Conversation.findById(conversationId).populate('productId');
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    // Determine receiver
    const isBuyer = conversation.buyerId.toString() === req.user.userId;
    const receiverId = isBuyer ? conversation.sellerId : conversation.buyerId;

    const newMessage = new Message({
      conversationId,
      senderId: req.user.userId,
      receiverId,
      text,
      productId: conversation.productId._id
    });
    await newMessage.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageTime = Date.now();
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();
    
    // Create Notification for receiver
    const Notification = require('../models/Notification');
    const notification = new Notification({
      userId: receiverId,
      type: 'message',
      relatedId: conversationId,
      message: `New message regarding: ${conversation.productId.title}`
    });
    await notification.save();

    // Socket emit if receiver is online
    const { io, connectedUsers } = require('../server');
    const receiverSocketId = connectedUsers.get(receiverId.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', newMessage);
      io.to(receiverSocketId).emit('new_notification', notification);
    }
    
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// PUT read messages
router.put('/read/:id', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);
    
    if (conversation && (conversation.buyerId.toString() === req.user.userId || conversation.sellerId.toString() === req.user.userId)) {
      conversation.unreadCount = 0;
      await conversation.save();
      await Message.updateMany(
        { conversationId, receiverId: req.user.userId, read: false },
        { $set: { read: true } }
      );
      res.json({ success: true });
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error marking read' });
  }
});

module.exports = router;
