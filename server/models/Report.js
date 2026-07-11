const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  issueType: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  screenshot: {
    type: String, // Store image URL/path if provided
    default: null
  },
  status: {
    type: String,
    default: "Open",
    enum: ["Open", "In Progress", "Resolved", "Closed"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
