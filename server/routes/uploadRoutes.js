const express = require("express");
const router = express.Router();
const multer = require("multer");
const { avatarStorage, productStorage } = require("../config/cloudinary");

// Configure Multer for Cloudinary
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload/avatar
router.post("/avatar", uploadAvatar.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  // req.file.path holds the Cloudinary URL
  res.json({ success: true, url: req.file.path });
});

// POST /api/upload/product
router.post("/product", uploadProduct.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  // req.file.path holds the Cloudinary URL
  res.json({ success: true, url: req.file.path });
});

module.exports = router;
