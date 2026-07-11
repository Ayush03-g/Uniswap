const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
require('../models/Product');
require('../models/Note');

router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId').populate('items.noteId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { productId, noteId } = req.body;
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }
    
    if (productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(productId);
      if (product && product.sellerId && product.sellerId.toString() === req.user.userId) {
        return res.status(403).json({ message: 'You cannot purchase or contact yourself for your own listing.' });
      }
    }
    
    // Prevent duplicate
    const exists = cart.items.find(item => 
      (productId && item.productId?.toString() === productId) || 
      (noteId && item.noteId?.toString() === noteId)
    );
    
    if (exists) {
      return res.status(400).json({ message: 'Item already in cart' });
    }
    
    cart.items.push({ productId, noteId });
    await cart.save();
    
    cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId').populate('items.noteId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (cart) {
      cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
      await cart.save();
    }
    const updatedCart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId').populate('items.noteId');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
