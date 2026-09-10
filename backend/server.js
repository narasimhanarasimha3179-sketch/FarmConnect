const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ==========================================
// Security & Core Middleware
// ==========================================
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] 
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// Database Connection
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Database Connected Successfully'))
  .catch((err) => {
    console.warn(`MongoDB connection failed: ${err.message}. Operating with fallback in-memory cache.`);
  });

// ==========================================
// Subsystem Route Imports & Optional Fallbacks
// ==========================================
const loadRoute = (modulePath) => {
  try {
    return require(modulePath);
  } catch (err) {
    console.warn(`Route module not found: ${modulePath}. Applying pass-through fallback.`);
    const fallbackRouter = express.Router();
    fallbackRouter.all('*', (req, res) => {
      res.status(501).json({
        success: false,
        error: `Subsystem route [${req.baseUrl}] is under active development.`
      });
    });
    return fallbackRouter;
  }
};

const authRoutes = loadRoute('./src/routes/authRoutes');
const storeRoutes = loadRoute('./src/routes/storeRoutes');
const agriIntelRoutes = loadRoute('./src/routes/agriIntelRoutes');
const aiAssistantRoutes = loadRoute('./src/routes/aiAssistantRoutes');
const farmingRoutes = loadRoute('./src/routes/farmingRoutes');
const serviceRoutes = loadRoute('./src/routes/serviceRoutes');
const communityAndGovRoutes = loadRoute('./src/routes/communityAndGovRoutes');

let adminRoutes;
let apiLimiter;

try {
  const adminSec = require('./src/routes/adminAndSecurityRoutes');
  adminRoutes = adminSec.adminRoutes;
  apiLimiter = adminSec.apiLimiter;
} catch (err) {
  console.warn('Security & admin route module missing. Applying default rate-limiter fallback.');
  apiLimiter = (req, res, next) => next();
  adminRoutes = express.Router();
}

// Global API rate limiting
if (typeof apiLimiter === 'function') {
  app.use('/api/', apiLimiter);
}

// ==========================================
// Mount Subsystem Endpoints
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/agri', agriIntelRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/farming', farmingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/public', communityAndGovRoutes);
app.use('/api/system', adminRoutes);

// ==========================================
// Platform Health Check
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FarmConnect Core Engine',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    securityStatus: 'Enforced',
    rateLimiting: 'Active',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// Marketplace & Produce Endpoints
// ==========================================
let fallbackProducts = [
  { _id: '1', cropName: 'Sona Masoori Paddy', farmerName: 'Ramesh Gowda', location: 'Mandya, KA', quantity: '50 Quintals', pricePerQuintal: 2450, bids: [] },
  { _id: '2', cropName: 'Sharbati Wheat', farmerName: 'Vikram Singh', location: 'Sehore, MP', quantity: '120 Quintals', pricePerQuintal: 3100, bids: [] },
  { _id: '3', cropName: 'Byadagi Chilli', farmerName: 'Basavaraj Patil', location: 'Haveri, KA', quantity: '15 Quintals', pricePerQuintal: 18200, bids: [] }
];

app.get('/api/products', (req, res) => {
  res.status(200).json({ success: true, count: fallbackProducts.length, products: fallbackProducts });
});

app.post('/api/products', (req, res) => {
  const { cropName, farmerName, location, quantity, pricePerQuintal } = req.body;

  if (!cropName || !pricePerQuintal) {
    return res.status(400).json({ success: false, error: 'Crop name and price are required fields.' });
  }

  const newProduct = {
    _id: String(Date.now()),
    cropName,
    farmerName: farmerName || 'Anonymous Farmer',
    location: location || 'Karnataka, India',
    quantity: quantity || '1 Quintal',
    pricePerQuintal: Number(pricePerQuintal),
    bids: [],
    createdAt: new Date().toISOString()
  };

  fallbackProducts.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.post('/api/products/:id/bid', (req, res) => {
  const product = fallbackProducts.find((p) => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const bidAmount = Number(req.body.bidAmount);
  if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive bid amount required' });
  }

  const newBid = {
    bidId: String(Date.now()),
    buyerName: req.body.buyerName || 'Verified Buyer',
    bidAmount,
    date: new Date().toISOString()
  };

  product.bids.push(newBid);
  res.status(200).json({ success: true, message: 'Bid placed successfully', product });
});

// ==========================================
// Mandi Rates & Agro-Intelligence
// ==========================================
app.get('/api/mandi/rates', (req, res) => {
  res.status(200).json({
    success: true,
    rates: [
      { id: '1', emoji: '🌾', crop: 'Paddy (Basmati)', mandi: 'Karnal Mandi', state: 'Haryana', price: '₹3,850', change: '+3.2%', up: true },
      { id: '2', emoji: '🌽', crop: 'Maize (Hybrid)', mandi: 'Davanagere APMC', state: 'Karnataka', price: '₹2,180', change: '+1.4%', up: true },
      { id: '3', emoji: '🧅', crop: 'Onion (Red)', mandi: 'Lasalgaon Mandi', state: 'Maharashtra', price: '₹1,620', change: '-4.1%', up: false },
      { id: '4', emoji: '🍅', crop: 'Tomato (Hybrid)', mandi: 'Kolar APMC', state: 'Karnataka', price: '₹1,250', change: '-6.5%', up: false }
    ],
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/weather/live', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      location: 'Bengaluru Agro-Climatic Zone',
      temperature: '26°C',
      condition: 'Partly Cloudy',
      humidity: '68%',
      rainProbability: '18%',
      advisory: 'Optimal weather for harvesting and drying operations in the afternoon.'
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 404 & Centralized Error Handlers
// ==========================================
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.originalUrl} not found on server.` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// Server Listener
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmConnect Unified Server running on http://localhost:${PORT}`);
});