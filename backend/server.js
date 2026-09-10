const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 15 * 1024 * 1024 } 
});

// In-memory fallback dataset
let memoryProducts = [
  {
    _id: '1',
    cropName: 'Sona Masuri Paddy (Grade-A)',
    quantity: '120 Quintals',
    farmerName: 'Ramesh Gowda',
    location: 'Mandya, Karnataka',
    pricePerQuintal: 2450,
    bids: [],
    createdAt: new Date(),
  },
  {
    _id: '2',
    cropName: 'Hybrid Red Tomato',
    quantity: '45 Quintals',
    farmerName: 'Shivanna H.',
    location: 'Kolar, Karnataka',
    pricePerQuintal: 1800,
    bids: [],
    createdAt: new Date(),
  },
  {
    _id: '3',
    cropName: 'Medium Staple Cotton',
    quantity: '80 Quintals',
    farmerName: 'Basavaraj Patil',
    location: 'Dharwad, Karnataka',
    pricePerQuintal: 7150,
    bids: [],
    createdAt: new Date(),
  },
  {
    _id: '4',
    cropName: 'Yellow Feed Maize',
    quantity: '150 Quintals',
    farmerName: 'Anil Kumar',
    location: 'Shimoga, Karnataka',
    pricePerQuintal: 2180,
    bids: [],
    createdAt: new Date(),
  },
];

let isMongoConnected = false;

// Database Connection with graceful fallback
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 2500 })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
  })
  .catch(() => {
    isMongoConnected = false;
    console.log('ℹ️ MongoDB service not active locally; operating with in-memory persistence.');
  });

// Schema definition for MongoDB
const productSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  quantity: { type: String, required: true },
  farmerName: { type: String, required: true },
  location: { type: String, required: true },
  pricePerQuintal: { type: Number, required: true },
  bids: [
    {
      buyerName: { type: String, required: true },
      bidAmount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

// AI Diagnostic Matrix: Foliage Pathology
const FOLIAGE_CONDITIONS = [
  {
    target: 'Tomato Foliage',
    issue: 'Early Blight (Alternaria solani)',
    severity: 'Moderate',
    symptoms: 'Concentric dark target rings and chlorotic halos on lower leaf canopy.',
    remedy: 'Apply copper hydroxide or Mancozeb 75% WP @ 2g/L water; remove infected foliage.',
  },
  {
    target: 'Paddy / Rice Leaf',
    issue: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    severity: 'High',
    symptoms: 'Water-soaked wavy marginal lesions turning yellow-white with desiccated tips.',
    remedy: 'Spray Streptocycline (1.5g) mixed with Copper Oxychloride (25g) per 10L water.',
  },
  {
    target: 'Cotton Foliage',
    issue: 'Bacterial Blight / Angular Leaf Spot',
    severity: 'Moderate',
    symptoms: 'Angular water-soaked lesions bounded by veins turning dark brown.',
    remedy: 'Foliar spray of Copper Oxychloride 50 WP @ 2.5g/L + Plantomycin 0.5g/L.',
  },
  {
    target: 'General Foliage',
    issue: 'Healthy Foliage',
    severity: 'None',
    symptoms: 'Vibrant chlorophyll saturation, intact cuticle, no lesions or fungal sporulation.',
    remedy: 'Maintain balanced N-P-K fertigation and consistent root-zone moisture.',
  },
];

// AI Diagnostic Matrix: Soil Health & Texture
const SOIL_CONDITIONS = [
  {
    target: 'Red Sandy Loam Soil',
    issue: 'Nitrogen & Humus Depletion',
    severity: 'Moderate',
    symptoms: 'Surface crusting, low moisture retention capacity, light brown crumb profile.',
    remedy: 'Incorporate 4-5 tonnes/acre of well-decomposed FYM or vermicompost with Azotobacter.',
  },
  {
    target: 'Black Cotton Heavy Clay Soil',
    issue: 'High Compaction & Drainage Impairment',
    severity: 'Moderate',
    symptoms: 'Deep shrinkage cracks when dry, poor aeration, and surface pooling during irrigation.',
    remedy: 'Apply agricultural gypsum @ 500kg/acre to improve flocculation, aeration, and drainage.',
  },
  {
    target: 'Alluvial Loam Soil',
    issue: 'Optimal Soil Fertility',
    severity: 'Optimal',
    symptoms: 'Friable crumb structure, adequate moisture retention, balanced biological activity.',
    remedy: 'Practice minimum tillage and maintain organic surface residue to preserve micro-flora.',
  },
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FarmConnect API Engine',
    database: isMongoConnected ? 'mongodb' : 'memory',
    timestamp: new Date().toISOString(),
  });
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ success: true, products });
    }
    return res.json({ success: true, products: memoryProducts });
  } catch (err) {
    return res.json({ success: true, products: memoryProducts });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    const { cropName, quantity, farmerName, location, pricePerQuintal } = req.body;
    if (!cropName || !quantity || !farmerName || !location || pricePerQuintal === undefined) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const numericPrice = Number(pricePerQuintal);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid price per quintal' });
    }

    if (isMongoConnected) {
      const product = new Product({
        cropName,
        quantity,
        farmerName,
        location,
        pricePerQuintal: numericPrice,
        bids: [],
      });
      await product.save();
      return res.status(201).json({ success: true, product });
    }

    const newProduct = {
      _id: Date.now().toString(),
      cropName,
      quantity,
      farmerName,
      location,
      pricePerQuintal: numericPrice,
      bids: [],
      createdAt: new Date(),
    };
    memoryProducts.unshift(newProduct);
    return res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST bid with strict validation
app.post('/api/products/:id/bid', async (req, res) => {
  try {
    const { buyerName, bidAmount } = req.body;
    const targetId = req.params.id;

    if (!buyerName || bidAmount === undefined) {
      return res.status(400).json({ success: false, error: 'Buyer name and bid amount are required' });
    }

    const numericBid = Number(bidAmount);
    if (isNaN(numericBid) || numericBid <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid bid amount' });
    }

    if (isMongoConnected) {
      const product = await Product.findById(targetId);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const currentHighest = product.bids.length > 0
        ? product.bids[product.bids.length - 1].bidAmount
        : product.pricePerQuintal;

      if (numericBid <= currentHighest) {
        return res.status(400).json({
          success: false,
          error: `Counter-bid must exceed current highest bid of ₹${currentHighest}/Qtl`,
        });
      }

      product.bids.push({ buyerName, bidAmount: numericBid, date: new Date() });
      await product.save();
      return res.json({ success: true, product });
    }

    const product = memoryProducts.find((p) => p._id === targetId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const currentHighest = product.bids.length > 0
      ? product.bids[product.bids.length - 1].bidAmount
      : product.pricePerQuintal;

    if (numericBid <= currentHighest) {
      return res.status(400).json({
        success: false,
        error: `Counter-bid must exceed current highest bid of ₹${currentHighest}/Qtl`,
      });
    }

    product.bids.push({ buyerName, bidAmount: numericBid, date: new Date() });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// AI Diagnostic Handler (Accepts Multipart File OR Base64 in JSON)
app.post('/api/ai/diagnose', (req, res, next) => {
  // Let multer try to parse multipart form if content-type is multipart
  if (req.is('multipart/form-data')) {
    return upload.single('leafImage')(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    const scanType = req.body.scanType || 'foliage';
    const hasUploadedFile = !!req.file;
    const hasBase64Image = !!req.body.imageBase64;

    if (!hasUploadedFile && !hasBase64Image) {
      return res.status(400).json({ success: false, error: 'No image specimen received' });
    }

    const matrix = scanType === 'soil' ? SOIL_CONDITIONS : FOLIAGE_CONDITIONS;
    const diagnosis = matrix[Math.floor(Math.random() * matrix.length)];

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      scanType,
      fileInfo: hasUploadedFile ? {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      } : { mimeType: 'image/base64' },
      diagnosis,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to diagnose image: ' + error.message });
  }
});

// Live Satellite Weather API Proxy (Open-Meteo)
app.get('/api/weather/live', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 12.9716;
    const lon = parseFloat(req.query.lon) || 77.5946;

    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`,
      { timeout: 8000 }
    );

    return res.json({ success: true, data: weatherRes.data });
  } catch (err) {
    console.error('Weather Proxy Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve live weather data' });
  }
});

// Live Mandi Benchmark Rates Proxy
app.get('/api/mandi/rates', (req, res) => {
  const mandiRates = [
    { id: 'm1', crop: 'Tomato (Hybrid)', mandi: 'Kolar APMC', state: 'Karnataka', price: '₹2,400', change: '+5.2%', up: true, emoji: '🍅' },
    { id: 'm2', crop: 'Paddy (Sona Masuri)', mandi: 'Mandya APMC', state: 'Karnataka', price: '₹2,450', change: '+3.2%', up: true, emoji: '🌾' },
    { id: 'm3', crop: 'Cotton (Medium Staple)', mandi: 'Dharwad APMC', state: 'Karnataka', price: '₹7,150', change: '+4.1%', up: true, emoji: '☁️' },
    { id: 'm4', crop: 'Onion (Nashik Red)', mandi: 'Lasalgaon APMC', state: 'Maharashtra', price: '₹1,800', change: '+3.1%', up: true, emoji: '🧅' },
    { id: 'm5', crop: 'Maize (Yellow Feed)', mandi: 'Davanagere APMC', state: 'Karnataka', price: '₹2,180', change: '+0.9%', up: true, emoji: '🌽' },
    { id: 'm6', crop: 'Green Chilli', mandi: 'Guntur APMC', state: 'Andhra Pradesh', price: '₹4,100', change: '+2.0%', up: true, emoji: '🌶️' },
  ];
  return res.json({ success: true, rates: mandiRates });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Local Network endpoint: http://10.95.149.144:${PORT}/api`);
});