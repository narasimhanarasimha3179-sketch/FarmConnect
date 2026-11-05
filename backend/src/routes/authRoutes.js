// FarmConnect Auth & Profile Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Public Authentication Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Endpoints
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Role Verification Test Endpoints
router.get('/farmer-only', authenticate, requireRole('FARMER'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Farmer Protected Hub', user: req.user });
});

router.get('/buyer-only', authenticate, requireRole('BUYER'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Buyer Protected Hub', user: req.user });
});

router.get('/seller-only', authenticate, requireRole('SELLER'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Seller Protected Hub', user: req.user });
});

router.get('/admin-only', authenticate, requireRole('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Admin Oversight Console', user: req.user });
});

module.exports = router;
