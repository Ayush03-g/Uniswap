const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  condition: { type: String, required: true },
  college: { type: String, default: 'Not specified' },
  whatsappNumber: { type: String, required: true },
  images: [{ type: String }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName: { type: String, default: 'Anonymous Student' },
  status: { type: String, default: 'active' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
