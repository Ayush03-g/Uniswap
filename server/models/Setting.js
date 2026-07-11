const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  platformName: { type: String, default: 'UniSwap - Campus Marketplace' },
  supportEmail: { type: String, default: 'support@uniswap.campus' },
  whatsappNumber: { type: String, default: '+91 9999999999' },
  universityEmailDomain: { type: String, default: '@medicaps.ac.in' },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
