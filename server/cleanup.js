const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const Conversation = require('./models/Conversation');
  const Message = require('./models/Message');
  const PurchaseRequest = require('./models/PurchaseRequest');
  const Notification = require('./models/Notification');
  
  await Conversation.deleteMany({});
  console.log('Deleted all conversations');
  
  await Message.deleteMany({});
  console.log('Deleted all messages');
  
  await Notification.deleteMany({ type: { $in: ['message', 'purchase_request'] } });
  console.log('Deleted chat/request notifications');
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
