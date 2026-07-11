const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sellerPrice: { type: Number, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  status: { type: String, enum: ['Interested', 'pending', 'accepted', 'rejected', 'completed'], default: 'Interested' },
  priceOffered: { type: Number },
  message: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
