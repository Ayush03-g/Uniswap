const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Fallback in-memory DB if MongoDB fails
const inMemoryProducts = [];
let idCounter = 1;

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// GET all active products (with dynamic filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      q, category, minPrice, maxPrice, condition, posted, sort, availability, college 
    } = req.query;

    let filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex }
      ];
    }

    if (category) {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (condition) {
      const conditions = condition.split(',');
      filter.condition = { $in: conditions };
    }

    if (posted) {
      const date = new Date();
      if (posted === 'today') date.setDate(date.getDate() - 1);
      else if (posted === 'last3days') date.setDate(date.getDate() - 3);
      else if (posted === 'lastweek') date.setDate(date.getDate() - 7);
      else if (posted === 'lastmonth') date.setMonth(date.getMonth() - 1);
      filter.createdAt = { $gte: date };
    }

    if (availability) {
      let statuses = availability.split(',').map(s => {
        if (s.toLowerCase() === 'available') return 'active';
        return s.toLowerCase();
      });
      filter.status = { $in: statuses };
    } else {
      filter.status = 'active'; 
    }

    if (college) {
      filter.college = new RegExp(college, 'i');
    }

    if (req.query.sellerId) {
      filter.sellerId = req.query.sellerId;
    }

    let sortOptions = { createdAt: -1 }; 
    if (sort) {
      if (sort === 'oldest') sortOptions = { createdAt: 1 };
      else if (sort === 'priceLow') sortOptions = { price: 1 };
      else if (sort === 'priceHigh') sortOptions = { price: -1 };
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json(inMemoryProducts.filter(p => p.status === 'active').sort((a, b) => b.createdAt - a.createdAt));
    }
    
    const products = await Product.find(filter).sort(sortOptions);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET products by search query
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (mongoose.connection.readyState !== 1) {
      const query = q.toLowerCase();
      const results = inMemoryProducts.filter(p => 
        p.status === 'active' && 
        (p.title?.toLowerCase().includes(query) || 
         p.category?.toLowerCase().includes(query) || 
         p.description?.toLowerCase().includes(query) ||
         p.sellerName?.toLowerCase().includes(query))
      );
      return res.json(results);
    }
    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      status: 'active',
      $or: [
        { title: regex },
        { category: regex },
        { description: regex }
      ]
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
  try {
    const cat = req.params.category;
    if (mongoose.connection.readyState !== 1) {
      const results = inMemoryProducts.filter(p => 
        p.status === 'active' && 
        p.category?.toLowerCase() === cat.toLowerCase()
      );
      return res.json(results);
    }
    const products = await Product.find({
      status: 'active',
      category: new RegExp(`^${cat}$`, 'i')
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET new arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    if (mongoose.connection.readyState !== 1) {
      const results = inMemoryProducts.filter(p => 
        p.status === 'active' && new Date(p.createdAt) >= fiveDaysAgo
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
      return res.json(results);
    }

    const products = await Product.find({
      status: 'active',
      createdAt: { $gte: fiveDaysAgo }
    }).sort({ createdAt: -1 }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Fallback
      const product = inMemoryProducts.find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.json(product);
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new product
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, price, condition, college, whatsappNumber } = req.body;
    
    if (!whatsappNumber || !/^\d{10}$/.test(whatsappNumber)) {
      return res.status(400).json({ message: "A valid 10-digit WhatsApp number is required." });
    }

    // Construct image URLs based on the server host
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const user = await User.findById(req.user.userId);

    if (mongoose.connection.readyState !== 1) {
      // Fallback
      const newProduct = {
        _id: String(idCounter++),
        title, description, category, price: Number(price), condition, college, whatsappNumber,
        images: imagePaths,
        status: 'active',
        sellerId: req.user.userId,
        sellerName: user ? user.name : 'Anonymous Student',
        createdAt: new Date()
      };
      inMemoryProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const newProduct = new Product({
      title,
      description,
      category,
      price,
      condition,
      college,
      whatsappNumber,
      images: imagePaths,
      sellerId: req.user.userId,
      sellerName: user ? user.name : 'Anonymous Student',
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Security: Verify seller
    if (product.sellerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this product' });
    }
    
    // Optionally remove files here (fs.unlinkSync) if images exist
    // For now we just remove from DB
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
