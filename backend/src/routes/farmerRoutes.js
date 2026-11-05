// FarmConnect Farmer Subsystem Routes
const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// All endpoints in this router require a verified FARMER role
router.use(authenticate, requireRole('FARMER'));

router.get('/profile', farmerController.getProfile);
router.put('/profile', farmerController.updateProfile);
router.get('/dashboard', farmerController.getDashboard);
router.post('/crops', farmerController.addCrop);
router.delete('/crops/:id', farmerController.removeCrop);

module.exports = router;
