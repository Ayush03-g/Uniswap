const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'BANNED'], default: 'ACTIVE' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerified: { type: Boolean, default: false },
  college: { type: String },
  course: { type: String },
  semester: { type: String },
  phoneNumber: { type: String },
  phoneVerified: { type: Boolean, default: false },
  phoneOTP: { type: String },
  phoneOTPExpires: { type: Date },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
