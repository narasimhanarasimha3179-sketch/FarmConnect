// FarmConnect Soil Health Routes (Phase 12)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const soilController = require('../controllers/soilController');

router.get('/reports', authenticate, soilController.getSoilReports);
router.get('/reports/:id', authenticate, soilController.getSoilReportById);
router.post('/reports', authenticate, soilController.createSoilReport);
router.post('/npk-calculator', soilController.calculateNpkDosage);

module.exports = router;
