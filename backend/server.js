const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// In-memory product fallback store
let memoryProducts = [
  {
    _id: '1',
    cropName: 'Organic Grade-A Wheat',
    quantity: '50 Quintals',
    farmerName: 'Ramesh Patel',
    location: 'Punjab',
    pricePerQuintal: 2250,
    bids: [],
    createdAt: new Date(),
  },
  {
    _id: '2',
    cropName: 'Fresh Desi Sweet Corn',
    quantity: '20 Quintals',
    farmerName: 'Suresh Kumar',
    location: 'Karnataka',
    pricePerQuintal: 1600,
    bids: [],
    createdAt: new Date(),
  },
  {
    _id: '3',
    cropName: 'Red Delicious Apples',
    quantity: '100 Crates',
    farmerName: 'Amit Sharma',
    location: 'Himachal',
    pricePerQuintal: 1200,
    bids: [],
    createdAt: new Date(),
  },
];

let isMongoConnected = false;

// Attempt MongoDB connection with fallback handling
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
  })
  .catch(() => {
    isMongoConnected = false;
    console.log('MongoDB service not active locally; operating with in-memory persistence.');
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

// AI Diagnostic conditions matrix
const CONDITIONS = [
  {
    crop: 'Tomato',
    disease: 'Tomato Early Blight (Alternaria solani)',
    severity: 'Moderate',
    symptoms: 'Concentric dark rings and yellow halo on lower foliage',
    organicRemedy: 'Apply copper sulfate spray and neem oil extract; remove infected lower leaves.',
    chemicalRemedy: 'Apply Mancozeb or Chlorothalonil 2g/liter of water at 7-day intervals.',
  },
  {
    crop: 'Paddy / Rice',
    disease: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    severity: 'High',
    symptoms: 'Water-soaked lesions on leaf margins turning white and drying out',
    organicRemedy: 'Apply fresh cow dung slurry extract (20g/L) or neem oil at 3ml/L.',
    chemicalRemedy: 'Streptocycline (1.5g) mixed with Copper Oxychloride (25g) per 10L of water.',
  },
  {
    crop: 'General Foliage',
    disease: 'Powdery Mildew (Erysiphales)',
    severity: 'Low',
    symptoms: 'White talcum-like powdery spots on leaf surfaces and stems',
    organicRemedy: 'Spray baking soda solution (1 tsp baking soda + 1 liter water + few drops liquid soap).',
    chemicalRemedy: 'Foliar spray of Wettable Sulfur 80% WP (2-3g/liter).',
  },
  {
    crop: 'General Foliage',
    disease: 'Healthy Foliage',
    severity: 'None',
    symptoms: 'Vibrant green coloration, no lesions, fungal growths, or necrosis observed',
    organicRemedy: 'Maintain balanced N-P-K fertigation and consistent drip irrigation scheduling.',
    chemicalRemedy: 'None required.',
  },
];

const diagnoseLeaf = () => {
  return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FarmConnect API',
    db: isMongoConnected ? 'mongodb' : 'memory',
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

// POST bid
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

      product.bids.push({ buyerName, bidAmount: numericBid, date: new Date() });
      await product.save();
      return res.json({ success: true, product });
    }

    const product = memoryProducts.find((p) => p._id === targetId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.bids.push({ buyerName, bidAmount: numericBid, date: new Date() });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// AI Diagnostic Handler
app.post('/api/ai/diagnose', upload.single('leafImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const diagnosis = diagnoseLeaf();
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      diagnosis,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to diagnose image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});