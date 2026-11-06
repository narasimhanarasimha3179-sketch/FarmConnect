// FarmConnect Logistics & Shipment Tracking Routes (Phase 20)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const logisticsController = require('../controllers/logisticsController');

// Public or Authenticated tracking endpoint
router.get('/track/:tracking_id', logisticsController.trackShipment);

// Seller/Admin dispatch endpoint
router.post('/dispatch', authenticate, logisticsController.createShipment);

// Logistics Status Update
router.put('/update-status', authenticate, logisticsController.updateShipmentStatus);

module.exports = router;
