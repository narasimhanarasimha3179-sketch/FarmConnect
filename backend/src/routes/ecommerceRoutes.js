// FarmConnect Agricultural E-Commerce Routes (Phase 7)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const ecommerceController = require('../controllers/ecommerceController');

// Public catalog routes (accessible without login, or with login for enriched info)
router.get('/categories', ecommerceController.getCategories);
router.get('/products', ecommerceController.getProducts);
router.get('/products/:id', ecommerceController.getProductById);

// Authenticated routes
router.post('/reviews', authenticate, ecommerceController.addProductReview);

module.exports = router;
