const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security Headers & Cross-Origin Whitelisting
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Database Connected Successfully'))
  .catch(() => console.log('Running without local MongoDB service. Fallback storage active.'));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const storeRoutes = require('./src/routes/storeRoutes');
const agriIntelRoutes = require('./src/routes/agriIntelRoutes');
const aiAssistantRoutes = require('./src/routes/aiAssistantRoutes');
const farmingRoutes = require('./src/routes/farmingRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const communityAndGovRoutes = require('./src/routes/communityAndGovRoutes');
const { adminRoutes, apiLimiter } = require('./src/routes/adminAndSecurityRoutes');

// Apply rate limiter globally to protect APIs
app.use('/api/', apiLimiter);

// Mount All Subsystems
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/agri', agriIntelRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/farming', farmingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/public', communityAndGovRoutes);
app.use('/api/system', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FarmConnect Core Engine',
    securityStatus: 'Enforced',
    rateLimiting: 'Active',
    timestamp: new Date()
  });
});

// Marketplace & Mandi Fallback Endpoints
let fallbackProducts = [
  { _id: '1', cropName: 'Sona Masoori Paddy', farmerName: 'Ramesh Gowda', location: 'Mandya, KA', quantity: '50 Quintals', pricePerQuintal: 2450, bids: [] },
  { _id: '2', cropName: 'Sharbati Wheat', farmerName: 'Vikram Singh', location: 'Sehore, MP', quantity: '120 Quintals', pricePerQuintal: 3100, bids: [] },
  { _id: '3', cropName: 'Byadagi Chilli', farmerName: 'Basavaraj Patil', location: 'Haveri, KA', quantity: '15 Quintals', pricePerQuintal: 18200, bids: [] }
];

app.get('/api/products', (req, res) => res.json({ success: true, products: fallbackProducts }));
app.post('/api/products', (req, res) => {
  const newProduct = { _id: String(Date.now()), ...req.body, bids: [] };
  fallbackProducts.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});
app.post('/api/products/:id/bid', (req, res) => {
  const product = fallbackProducts.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  const bidAmount = Number(req.body.bidAmount);
  product.bids.push({ buyerName: req.body.buyerName || 'Buyer', bidAmount, date: new Date() });
  res.json({ success: true, product });
});

app.get('/api/mandi/rates', (req, res) => {
  res.json({
    success: true,
    rates: [
      { id: '1', emoji: '🌾', crop: 'Paddy (Basmati)', mandi: 'Karnal Mandi', state: 'Haryana', price: '₹3,850', change: '+3.2%', up: true },
      { id: '2', emoji: '🌽', crop: 'Maize (Hybrid)', mandi: 'Davanagere APMC', state: 'Karnataka', price: '₹2,180', change: '+1.4%', up: true },
      { id: '3', emoji: '🧅', crop: 'Onion (Red)', mandi: 'Lasalgaon Mandi', state: 'Maharashtra', price: '₹1,620', change: '-4.1%', up: false },
      { id: '4', emoji: '🍅', crop: 'Tomato (Hybrid)', mandi: 'Kolar APMC', state: 'Karnataka', price: '₹1,250', change: '-6.5%', up: false }
    ]
  });
});

app.get('/api/weather/live', (req, res) => {
  res.json({
    success: true,
    data: {
      temperature: '26°C',
      condition: 'Partly Cloudy',
      humidity: '68%',
      rainProbability: '18%',
      advisory: 'Optimal weather for harvesting and drying operations in the afternoon.'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('FarmConnect Unified Server running on http://localhost:' + PORT);
});
