// FarmConnect API Documentation & OpenAPI Explorer (Phase 27)
const express = require('express');
const router = express.Router();

const apiDocSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FarmConnect Smart Agriculture Platform API',
    version: '1.0.0-phase32',
    description: 'Production-ready OpenAPI 3.0 specification for FarmConnect platform across all 32 development phases.',
  },
  endpoints: [
    { method: 'GET', path: '/api/health', description: 'System health & operational metrics' },
    { method: 'POST', path: '/api/auth/register', description: 'User registration with multi-role support' },
    { method: 'POST', path: '/api/auth/login', description: 'User authentication & JWT token generation' },
    { method: 'GET', path: '/api/farmer/dashboard', description: 'Farmer aggregated dashboard metrics' },
    { method: 'GET', path: '/api/buyer/products', description: 'Buyer product catalog' },
    { method: 'POST', path: '/api/buyer/checkout', description: 'Place order and clear cart' },
    { method: 'POST', path: '/api/seller/products', description: 'Add new merchant product' },
    { method: 'GET', path: '/api/admin/stats', description: 'Platform governance metrics' },
    { method: 'GET', path: '/api/ecommerce/products', description: 'Agricultural inputs in 10 verified categories' },
    { method: 'GET', path: '/api/crop-market/listings', description: 'Direct farmer crop marketplace' },
    { method: 'GET', path: '/api/mandi/live', description: 'Live verified APMC mandi prices' },
    { method: 'GET', path: '/api/weather/forecast', description: 'Location-based micro-climate weather advisory' },
    { method: 'GET', path: '/api/crop-assistance/guides', description: 'Crop cultivation agronomic guides' },
    { method: 'POST', path: '/api/soil/recommend', description: 'Precision N-P-K dosage calculator' },
    { method: 'POST', path: '/api/pest-disease/diagnose', description: 'Field symptom disease matching' },
    { method: 'POST', path: '/api/camera-ai/scan', description: 'Computer vision leaf pathology diagnosis' },
    { method: 'POST', path: '/api/ai/chat', description: 'Contextual AI agricultural advisor' },
    { method: 'GET', path: '/api/schemes/list', description: 'Central & State government farmer welfare schemes' },
    { method: 'POST', path: '/api/payments/create-intent', description: 'Checkout payment gateway session' },
    { method: 'POST', path: '/api/payments/verify', description: 'Payment verification and order status transition' },
    { method: 'GET', path: '/api/payments/receipt/:order_id', description: 'GST compliance tax receipt' },
    { method: 'GET', path: '/api/logistics/track/:tracking_id', description: '5-stage real-time shipment tracking' },
    { method: 'POST', path: '/api/logistics/dispatch', description: 'Consignment dispatch generator' },
    { method: 'GET', path: '/api/notifications', description: 'User notifications inbox and alerts' },
    { method: 'GET', path: '/api/community/posts', description: 'Agricultural community social discussions' },
    { method: 'GET', path: '/api/library/articles', description: 'Agronomic digital reference library' },
    { method: 'GET', path: '/api/search', description: 'Universal search across products, crops, mandi, schemes' },
  ],
};

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    documentation: apiDocSpec,
  });
});

module.exports = router;
