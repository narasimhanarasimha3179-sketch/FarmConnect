const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'seller', 'transporter', 'expert', 'admin'],
    default: 'farmer'
  },
  location: {
    state: { type: String, default: 'Karnataka' },
    district: { type: String, default: 'Bengaluru' },
    pincode: { type: String, default: '560001' }
  },
  specialization: { type: String, default: '' },
  vehicleType: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
