// FarmConnect Express Application (Phases 0 to 32)
const express = require('express');
const cors = require('cors');

// Security & Optimization Middleware (Phase 25, 26, 30)
const { rateLimiter, securityHeaders, inputSanitizer } = require('./middleware/securityMiddleware');

// Route Modules
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
const paymentRoutes = require('./routes/paymentRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const searchRoutes = require('./routes/searchRoutes');
const docsRoutes = require('./routes/docsRoutes');
const liveRoutes = require('./routes/liveRoutes');

const app = express();

// Security Headers (Phase 25)
app.use(securityHeaders);

// CORS Policy
app.use(cors());

// Body Parsers & Input Sanitizer (Phase 25)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(inputSanitizer);

// Rate Limiter (Phase 25)
app.use(rateLimiter);

// Performance & Cache Control Headers (Phase 30)
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'FarmConnect Agriculture Platform OS');
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});

// Request Diagnostics & Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root Status & Health Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'FarmConnect Smart Agriculture Platform API',
    message: '🌱 FarmConnect Operational OS Live & Running',
    version: '1.0.0-phase32',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      telemetry: '/api/live/telemetry',
      auth: '/api/auth',
    },
  });
});

// Health & System Info Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'FarmConnect Smart Agriculture Platform API',
    version: '1.0.0-phase32',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
  });
});

// Mount All Domain Routes (Phases 1 - 27)
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
app.use('/api/payments', paymentRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/live', liveRoutes);

// Static Web Application Serving (Phases 1 - 32)
const path = require('path');
const fs = require('fs');

const staticCandidates = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../mobile-android/dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../../public'),
];

const webDistPath = staticCandidates.find(dir => fs.existsSync(path.join(dir, 'index.html')));

if (webDistPath) {
  console.log(`[Frontend] Serving FarmConnect Web App from: ${webDistPath}`);
  app.use(express.static(webDistPath));

  // SPA browser navigation fallback for frontend screens
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

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
