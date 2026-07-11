const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  university: { type: String },
  type: { type: String, enum: ['HardCopy', 'Digital'], required: true },
  price: { type: Number, required: true },
  description: { type: String },
  condition: { type: String },
  pages: { type: Number },
  fileUrl: { type: String }, // For digital PDFs
  images: [{ type: String }],
  status: { type: String, enum: ['available', 'sold'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
