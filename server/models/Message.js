const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['text', 'system', 'purchase_request'], default: 'text' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  purchaseRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  read: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  readAt: { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
