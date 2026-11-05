// FarmConnect Buyer Subsystem Routes
const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// All endpoints in this router require a verified BUYER role
router.use(authenticate, requireRole('BUYER'));

router.get('/dashboard', buyerController.getDashboard);
router.get('/catalog', buyerController.getCatalog);
router.get('/cart', buyerController.getCart);
router.post('/cart', buyerController.addToCart);
router.delete('/cart/:id', buyerController.removeFromCart);
router.get('/wishlist', buyerController.getWishlist);
router.post('/wishlist', buyerController.toggleWishlist);
router.post('/checkout', buyerController.checkout);
router.get('/orders', buyerController.getOrders);
router.get('/orders/:id', buyerController.getOrderTracking);
router.post('/reviews', buyerController.addReview);

module.exports = router;
