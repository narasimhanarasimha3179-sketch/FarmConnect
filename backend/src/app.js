// FarmConnect Express Application
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ecommerceRoutes = require('./routes/ecommerceRoutes');
const cropMarketRoutes = require('./routes/cropMarketRoutes');
const mandiRoutes = require('./routes/mandiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const cropAssistanceRoutes = require('./routes/cropAssistanceRoutes');
const soilRoutes = require('./routes/soilRoutes');
const pestDiseaseRoutes = require('./routes/pestDiseaseRoutes');
const cameraAiRoutes = require('./routes/cameraAiRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const schemeRoutes = require('./routes/schemeRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health & System Info Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'FarmConnect Smart Agriculture Platform API',
    version: '1.0.0-phase2',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/crop-market', cropMarketRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/crop-assistance', cropAssistanceRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/pest-disease', pestDiseaseRoutes);
app.use('/api/camera-ai', cameraAiRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/schemes', schemeRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found on FarmConnect server.`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: err.message,
  });
});

module.exports = app;
