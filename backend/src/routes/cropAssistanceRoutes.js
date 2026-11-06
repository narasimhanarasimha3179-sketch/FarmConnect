// FarmConnect Crop Assistance Routes (Phase 11)
const express = require('express');
const router = express.Router();
const cropAssistanceController = require('../controllers/cropAssistanceController');

router.get('/guides', cropAssistanceController.getCropGuides);
router.get('/guides/:id', cropAssistanceController.getCropGuideById);
router.get('/calendar', cropAssistanceController.getSeasonalCalendar);

module.exports = router;
