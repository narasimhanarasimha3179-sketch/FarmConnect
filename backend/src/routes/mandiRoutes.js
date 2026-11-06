// FarmConnect Mandi Price Routes (Phase 9)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const mandiController = require('../controllers/mandiController');

// Public Mandi Ingestion & Ticker Endpoints
router.get('/rates', mandiController.getMandiRates);
router.get('/commodities', mandiController.getCommodities);
router.get('/history', mandiController.getPriceHistory);
router.get('/comparison', mandiController.getMarketComparison);

// Authenticated Price Alerts
router.post('/alerts', authenticate, mandiController.createPriceAlert);
router.get('/alerts', authenticate, mandiController.getUserPriceAlerts);
router.delete('/alerts/:id', authenticate, mandiController.deletePriceAlert);

module.exports = router;
