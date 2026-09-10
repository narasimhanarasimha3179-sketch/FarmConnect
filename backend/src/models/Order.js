const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  buyerName: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'UPI', 'NetBanking'], default: 'COD' },
  orderStatus: { type: String, enum: ['Placed', 'Packed', 'Shipped', 'Delivered'], default: 'Placed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
