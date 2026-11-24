// FarmConnect Live Telemetry & Real-Time Sync Routes
const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');

router.get('/telemetry', liveController.getLiveTelemetry);
router.get('/updates', liveController.getLiveUpdates);

module.exports = router;
