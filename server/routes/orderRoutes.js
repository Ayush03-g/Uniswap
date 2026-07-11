const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, async (req, res) => {
  try {
    const { sellerId, itemId, itemModel, amount } = req.body;
    const buyerId = req.user.userId;

    const order = new Order({
      buyerId,
      sellerId,
      itemId,
      itemModel,
      amount,
      status: 'Completed'
    });
    await order.save();

    // Fees calculation
    // const platformFee = amount * 0.10;
    // const sellerCredit = amount * 0.90;

    // Notification
    await Notification.create({
      userId: sellerId,
      type: 'sale',
      message: `You just sold a ${itemModel} for ₹${amount}.`,
      relatedId: order._id
    });

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
