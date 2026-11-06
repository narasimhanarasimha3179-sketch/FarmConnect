// FarmConnect Seller Subsystem Routes
const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// All endpoints in this router require a verified SELLER role
router.use(authenticate, requireRole('SELLER'));

router.get('/dashboard', sellerController.getDashboard);
router.get('/products', sellerController.getProducts);
router.post('/products', sellerController.addProduct);
router.put('/products/:id', sellerController.updateProduct);
router.delete('/products/:id', sellerController.deleteProduct);
router.get('/orders', sellerController.getOrders);
router.put('/orders/:id/status', sellerController.updateOrderStatus);
router.get('/reports', sellerController.getReports);
router.get('/batches', sellerController.getBatches);
router.get('/credit-ledger', sellerController.getCreditLedger);
router.post('/credit-ledger/settle', sellerController.recordCreditPayment);

module.exports = router;
