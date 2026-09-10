const mongoose = require('mongoose');

// 1. Transporter & Freight Shipment Schema
const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  farmerName: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  cropType: { type: String, required: true },
  weightTons: { type: Number, required: true },
  distanceKm: { type: Number, required: true },
  estimatedFreightCost: { type: Number, required: true },
  transporterName: { type: String, default: 'Kisan Cargo Express' },
  vehicleRegNo: { type: String, default: 'KA-04-E-8821' },
  status: {
    type: String,
    enum: ['Requested', 'Assigned', 'In-Transit', 'Delivered'],
    default: 'Requested'
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. Payment & Escrow Transaction Schema
const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  orderOrLotId: { type: String, required: true },
  payerName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'NEFT', 'Card', 'Escrow'], default: 'UPI' },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Escrow-Locked', 'Refunded'], default: 'Completed' },
  upiRefNumber: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// 3. Agronomist Consultation Booking Schema
const consultationSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  expertName: { type: String, required: true },
  cropIssueTopic: { type: String, required: true },
  consultationDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  meetingStatus: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Shipment: mongoose.model('Shipment', shipmentSchema),
  Payment: mongoose.model('Payment', paymentSchema),
  Consultation: mongoose.model('Consultation', consultationSchema)
};
