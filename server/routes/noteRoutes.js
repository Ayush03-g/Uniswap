const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and images allowed'));
    }
  }
});

router.post('/upload', auth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'images', maxCount: 5 }]), async (req, res) => {
  try {
    const { title, type, price } = req.body;
    const fileUrl = req.files['file'] ? req.files['file'][0].path : null;
    const images = req.files['images'] ? req.files['images'].map(f => f.path) : [];
    
    const note = new Note({
      sellerId: req.user.userId,
      title,
      type,
      price,
      fileUrl,
      images
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find().populate('sellerId', 'name email');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
