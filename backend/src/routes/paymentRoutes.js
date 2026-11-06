// FarmConnect Payment Routes (Phase 19)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Checkout intent & session initiation (Authenticated)
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);

// Transaction verification & confirmation (Authenticated or Webhook)
router.post('/verify', authenticate, paymentController.verifyPayment);

// Digital Tax Invoice / Payment Receipt
router.get('/receipt/:order_id', authenticate, paymentController.getPaymentReceipt);

// Refund processing
router.post('/refund', authenticate, paymentController.processRefund);

module.exports = router;
