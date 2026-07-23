const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional for DIRECT_CHAT
  type: { type: String, enum: ['PRODUCT_CHAT', 'DIRECT_CHAT'], default: 'PRODUCT_CHAT' },
  lastMessage: { type: String, default: "" },
  lastMessageTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 }, // We can keep this for backward compat or migrate to per-user
  buyerUnread: { type: Number, default: 0 },
  sellerUnread: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Conversation', conversationSchema);
