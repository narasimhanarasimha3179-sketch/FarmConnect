const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory Multer storage for leaf photos
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Diagnostic Rule/Mock Engine
const diagnoseLeaf = (filename) => {
  const conditions = [
    {
      disease: 'Tomato Early Blight (Alternaria solani)',
      severity: 'Moderate',
      symptoms: 'Concentric dark rings and yellow halo on lower foliage',
      organicRemedy: 'Apply copper sulfate spray and neem oil extract; remove infected lower leaves.',
      chemicalRemedy: 'Apply Mancozeb or Chlorothalonil 2g/liter of water at 7-day intervals.'
    },
    {
      disease: 'Powdery Mildew (Erysiphales)',
      severity: 'Low',
      symptoms: 'White talcum-like powdery spots on leaf surfaces and stems',
      organicRemedy: 'Spray baking soda solution (1 tsp baking soda + 1 liter water + few drops liquid soap).',
      chemicalRemedy: 'Foliar spray of Wettable Sulfur 80% WP (2-3g/liter).'
    },
    {
      disease: 'Healthy Foliage',
      severity: 'None',
      symptoms: 'Vibrant green coloration, no lesions, fungal growths, or necrosis observed',
      organicRemedy: 'Maintain balanced N-P-K fertigation and consistent drip irrigation scheduling.',
      chemicalRemedy: 'None required.'
    }
  ];
  return conditions[Math.floor(Math.random() * conditions.length)];
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FarmConnect API' });
});

// AI Diagnosis Endpoint
app.post('/api/ai/diagnose', upload.single('leafImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const diagnosis = diagnoseLeaf(req.file.originalname);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnosis
    });
  } catch (error) {
    console.error('Diagnosis Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to diagnose image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});