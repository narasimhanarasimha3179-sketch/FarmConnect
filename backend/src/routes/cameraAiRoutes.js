// FarmConnect Camera AI Routes (Phase 14)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const cameraAiController = require('../controllers/cameraAiController');

router.post('/analyze', authenticate, cameraAiController.analyzeCropImage);
router.get('/history', authenticate, cameraAiController.getScanHistory);

module.exports = router;
