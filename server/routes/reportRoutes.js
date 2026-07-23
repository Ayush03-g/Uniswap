const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const multer = require("multer");
const path = require("path");

// Configure Multer for screenshot uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// POST /api/reports
router.post("/", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, email, issueType, subject, description } = req.body;
    let screenshotUrl = null;

    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
    }

    // Save to Database
    const newReport = new Report({
      name,
      email,
      issueType,
      subject,
      description,
      screenshot: screenshotUrl
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: newReport
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ success: false, message: "Server error submitting report" });
  }
});

module.exports = router;
