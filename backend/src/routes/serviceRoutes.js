const express = require('express');
const router = express.Router();
const { Shipment, Payment, Consultation } = require('../models/LogisticsAndServices');

// In-memory fallbacks
let fallbackShipments = [
  {
    trackingId: 'TRK-9021',
    farmerName: 'Ramesh Gowda',
    pickupLocation: 'Mandya Farm Gate',
    dropLocation: 'Yeshwanthpur APMC Bangalore',
    cropType: 'Sona Masoori Paddy',
    weightTons: 5.5,
    distanceKm: 110,
    estimatedFreightCost: 6500,
    transporterName: 'Cauvery Freight Haulers',
    vehicleRegNo: 'KA-11-B-4312',
    status: 'In-Transit'
  }
];

let fallbackConsultations = [
  {
    bookingId: 'CON-501',
    farmerName: 'Basavaraj Patil',
    farmerPhone: '9845012345',
    expertName: 'Dr. Girish K (Soil Pathologist, UAS Dharwad)',
    cropIssueTopic: 'Chilli leaf curl virus & thrips management',
    consultationDate: '2026-09-15',
    timeSlot: '11:30 AM - 12:00 PM',
    meetingStatus: 'Scheduled'
  }
];

// --- 1. LOGISTICS: FREIGHT RATE CALCULATOR & DISPATCH ---
router.post('/logistics/estimate', (req, res) => {
  const { pickupLocation, dropLocation, cropType, weightTons, distanceKm } = req.body;
  const dist = Number(distanceKm) || 50;
  const wt = Number(weightTons) || 1;

  // Base rate calculation: ₹35 base per km + ₹800 base handling per ton
  const freightCost = Math.round((dist * 35) + (wt * 800));

  res.json({
    success: true,
    pickupLocation: pickupLocation || 'Farm Gate',
    dropLocation: dropLocation || 'District APMC Yard',
    cropType: cropType || 'Bulk Produce',
    distanceKm: dist,
    weightTons: wt,
    estimatedCost: freightCost,
    recommendedTruckType: wt <= 2 ? 'Tata Ace (1.5 - 2T)' : wt <= 6 ? 'Eicher 11.10 (5 - 6T)' : '10-Wheeler Heavy Hauler (16T)'
  });
});

router.post('/logistics/dispatch', (req, res) => {
  const { farmerName, pickupLocation, dropLocation, cropType, weightTons, distanceKm } = req.body;
  const trackingId = 'TRK-' + Math.floor(1000 + Math.random() * 9000);
  const dist = Number(distanceKm) || 50;
  const wt = Number(weightTons) || 1;
  const cost = Math.round((dist * 35) + (wt * 800));

  const newShipment = {
    trackingId,
    farmerName: farmerName || 'Kisan User',
    pickupLocation,
    dropLocation,
    cropType,
    weightTons: wt,
    distanceKm: dist,
    estimatedFreightCost: cost,
    transporterName: 'Kisan Regional Cargo',
    vehicleRegNo: 'KA-09-TR-7712',
    status: 'Assigned'
  };

  fallbackShipments.unshift(newShipment);
  res.status(201).json({ success: true, trackingId, shipment: newShipment });
});

router.get('/logistics/track/:trackingId', (req, res) => {
  const shipment = fallbackShipments.find(s => s.trackingId === req.params.trackingId);
  if (!shipment) return res.status(404).json({ success: false, error: 'Shipment tracking ID not found' });
  res.json({ success: true, shipment });
});

// --- 2. PAYMENTS & ESCROW VERIFICATION ---
router.post('/payment/verify-upi', (req, res) => {
  const { payerName, amount, orderOrLotId, upiId } = req.body;
  if (!amount || !orderOrLotId) {
    return res.status(400).json({ success: false, error: 'Amount and Lot ID required' });
  }

  const txnId = 'TXN-' + Date.now();
  const upiRef = 'UPI-' + Math.floor(100000000000 + Math.random() * 900000000000);

  res.status(200).json({
    success: true,
    transactionId: txnId,
    orderOrLotId,
    payerName: payerName || 'Direct Buyer',
    amountTransferred: Number(amount),
    paymentStatus: 'Escrow-Locked',
    bankUpiRef: upiRef,
    note: 'Payment locked in Kisan Escrow. Funds will be released to farmer upon produce weight verification.',
    timestamp: new Date()
  });
});

// --- 3. EXPERT CONSULTATION SCHEDULER ---
router.get('/experts/directory', (req, res) => {
  res.json({
    success: true,
    experts: [
      { id: 'EXP-1', name: 'Dr. Girish K', specialization: 'Soil Pathologist & Nematology', institution: 'UAS Dharwad', fee: 'Free (ICAR Scheme)' },
      { id: 'EXP-2', name: 'Prof. Anitha Rao', specialization: 'Organic Agronomy & Bio-Fertilizers', institution: 'GKVK Bangalore', fee: 'Free (ICAR Scheme)' },
      { id: 'EXP-3', name: 'Er. Suresh Hiremath', specialization: 'Drip Irrigation & Micro-Climate Control', institution: 'Water Management Directorate', fee: 'Free' }
    ]
  });
});

router.post('/experts/book', (req, res) => {
  const { farmerName, farmerPhone, expertName, cropIssueTopic, consultationDate, timeSlot } = req.body;
  const bookingId = 'CON-' + Math.floor(100 + Math.random() * 900);

  const booking = {
    bookingId,
    farmerName: farmerName || 'Kisan User',
    farmerPhone: farmerPhone || '9900112233',
    expertName: expertName || 'Dr. Girish K',
    cropIssueTopic: cropIssueTopic || 'General Disease Query',
    consultationDate: consultationDate || '2026-09-12',
    timeSlot: timeSlot || '02:00 PM - 02:30 PM',
    meetingStatus: 'Scheduled'
  };

  fallbackConsultations.unshift(booking);
  res.status(201).json({ success: true, bookingId, consultation: booking });
});

module.exports = router;
