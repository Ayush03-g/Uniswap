const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const multer = require("multer");
const path = require("path");
const transporter = require('../config/smtp');

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

    // Setup Nodemailer
    let fromAddress = 'noreply@uniswap.com';
    if (process.env.EMAIL_FROM) {
      fromAddress = process.env.EMAIL_FROM;
    }
    
    const mailOptions = {
      from: fromAddress,
      to: 'ayush.garg.399167@gmail.com',
        subject: `New UniSwap Report: [${issueType}] ${subject}`,
        html: `
          <h3>New Issue Reported on UniSwap</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Issue Type:</strong> ${issueType}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
          ${screenshotUrl ? `<p><strong>Screenshot:</strong> Included as attachment or accessible via server <code>${screenshotUrl}</code></p>` : ""}
        `,
      };

      // If there's an uploaded file, attach it to the email
      if (req.file) {
        mailOptions.attachments = [
          {
            filename: req.file.filename,
            path: req.file.path
          }
        ];
      }

      // Send email asynchronously without blocking the response if it fails
      transporter.sendMail(mailOptions).catch(err => {
        console.error("Nodemailer failed to send email:", err);
      });
    } else {
      console.warn("SMTP variables not set in environment variables. Email notification was not sent.");
    }

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
