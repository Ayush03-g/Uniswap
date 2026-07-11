const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['message', 'buy_request', 'purchase_request', 'request_accepted', 'request_rejected', 'product_sold', 'new_product', 'admin_message', 'Announcement'], required: true },
  title: { type: String, default: 'Notification' },
  message: { type: String, required: true },
  sender: { type: String, default: 'System' },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  productImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
