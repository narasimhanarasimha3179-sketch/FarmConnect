const mongoose = require('mongoose');

const productStoreSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Irrigation', 'Bio-Stimulants'] 
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  unit: { type: String, default: 'kg' },
  sellerName: { type: String, default: 'AgriInput Certified Hub' },
  description: { type: String, default: 'High quality agricultural input verified for standard farming.' },
  rating: { type: Number, default: 4.8 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductStore', productStoreSchema);
