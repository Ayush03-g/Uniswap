const express = require('express');
const router = express.Router();
const PurchaseRequest = require('../models/PurchaseRequest');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

// POST create purchase request
router.post('/', auth, async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    const User = require('../models/User');
    const buyer = await User.findById(req.user.userId);
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.sellerId && product.sellerId.toString() === req.user.userId) {
      return res.status(403).json({ message: 'You cannot purchase or contact yourself for your own listing.' });
    }
    
    // Check if request already exists to prevent duplicates
    const existingRequest = await PurchaseRequest.findOne({
      productId,
      buyerId: req.user.userId
    });

    if (existingRequest) {
      const existingConversation = await Conversation.findOne({
        buyerId: req.user.userId,
        sellerId,
        productId
      });
      if (existingConversation) {
        return res.status(200).json({ 
          message: 'Conversation already exists', 
          request: existingRequest, 
          conversationId: existingConversation._id 
        });
      }
    }
    // Find or create conversation
    let conversation = await Conversation.findOne({
      buyerId: req.user.userId,
      sellerId,
      productId
    });

    if (!conversation) {
      conversation = new Conversation({
        buyerId: req.user.userId,
        sellerId,
        productId
      });
      await conversation.save();
    }

    const newRequest = new PurchaseRequest({
      productId,
      productName: product.title,
      sellerPrice: product.price,
      buyerId: req.user.userId,
      sellerId,
      conversationId: conversation._id,
      status: 'Interested'
    });
    await newRequest.save();
    
    const automatedMessageText = `👋 Hello!\n\nI'm interested in your product:\n\n📦 Product: ${product.title}\n\n💰 Price: ₹${product.price}\n\nIs it still available?`;
    
    // Create the automated Chat Message linked to the request
    const automatedMessage = new Message({
      conversationId: conversation._id,
      senderId: req.user.userId,
      receiverId: sellerId,
      text: automatedMessageText,
      type: 'purchase_request',
      productId,
      purchaseRequestId: newRequest._id
    });
    await automatedMessage.save();
    
    const notificationMsg = `${buyer.name} is interested in your product '${product.title}'.`;
    
    // Create notification for seller
    const notification = new Notification({
      userId: sellerId,
      type: 'purchase_request',
      relatedId: newRequest._id,
      message: notificationMsg
    });
    await notification.save();
    
    // Socket emit to seller if online
    const { io, connectedUsers } = require('../server');
    const sellerSocketId = connectedUsers.get(sellerId.toString());
    if (sellerSocketId) {
      io.to(sellerSocketId).emit('new_notification', notification);
      
      // Also emit the real-time message
      const populatedMsg = await Message.findById(automatedMessage._id)
        .populate('senderId', 'name')
        .populate('productId', 'title price images category condition');
        
      io.to(sellerSocketId).emit('receive_message', populatedMsg);
    }
    
    res.status(201).json({ request: newRequest, conversationId: conversation._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating purchase request' });
  }
});

// PUT accept/reject request
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'
    const request = await PurchaseRequest.findById(req.params.id).populate('productId');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    // Only seller can accept/reject
    if (request.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    request.status = status;
    await request.save();
    
    // If accepted, update product status
    if (status === 'Accepted') {
      await Product.findByIdAndUpdate(request.productId._id, { status: 'reserved' });
    }

    // Find conversation to send system message
    const conversation = await Conversation.findOne({
      buyerId: request.buyerId,
      sellerId: req.user.userId,
      productId: request.productId._id
    });

    if (conversation) {
      const text = status === 'Accepted' 
        ? '✅ Your purchase request has been accepted.'
        : '❌ Your purchase request has been declined.';
        
      const systemMessage = new Message({
        conversationId: conversation._id,
        senderId: req.user.userId,
        receiverId: request.buyerId,
        text,
        type: 'system'
      });
      await systemMessage.save();

      const { io, connectedUsers } = require('../server');
      const buyerSocketId = connectedUsers.get(request.buyerId.toString());
      if (buyerSocketId) {
        const populatedMsg = await Message.findById(systemMessage._id).populate('senderId', 'name');
        io.to(buyerSocketId).emit('receive_message', populatedMsg);
      }
    }
    
    // Notify buyer
    const notification = new Notification({
      userId: request.buyerId,
      type: status === 'Accepted' ? 'request_accepted' : 'request_rejected',
      relatedId: request._id,
      message: `Your purchase request for ${request.productId.title} was ${status}`
    });
    await notification.save();
    
    const { io, connectedUsers } = require('../server');
    const buyerSocketId = connectedUsers.get(request.buyerId.toString());
    if (buyerSocketId) {
      io.to(buyerSocketId).emit('new_notification', notification);
    }
    
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating purchase request' });
  }
});

// GET user's purchase requests
router.get('/', auth, async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({
      $or: [{ buyerId: req.user.userId }, { sellerId: req.user.userId }]
    }).populate('productId', 'title images price').populate('buyerId', 'name').populate('sellerId', 'name');
    
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

module.exports = router;
