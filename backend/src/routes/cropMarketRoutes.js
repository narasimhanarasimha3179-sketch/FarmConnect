// FarmConnect Crop Marketplace Routes (Phase 8)
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const cropMarketController = require('../controllers/cropMarketController');

// Public / Browse Listings
router.get('/listings', cropMarketController.getCropListings);
router.get('/listings/:id', cropMarketController.getCropListingById);

// Farmer Listings Operations
router.post('/listings', authenticate, requireRole('FARMER', 'ADMIN'), cropMarketController.createCropListing);
router.get('/farmer/my-listings', authenticate, requireRole('FARMER', 'ADMIN'), cropMarketController.getFarmerMyListings);
router.put('/listings/:id', authenticate, cropMarketController.updateCropListing);
router.delete('/listings/:id', authenticate, cropMarketController.deleteCropListing);

// Buyer Enquiries & Price Negotiation
router.post('/enquiries', authenticate, requireRole('BUYER', 'ADMIN'), cropMarketController.createCropEnquiry);
router.get('/buyer/enquiries', authenticate, requireRole('BUYER', 'ADMIN'), cropMarketController.getBuyerEnquiries);
router.get('/farmer/enquiries', authenticate, requireRole('FARMER', 'ADMIN'), cropMarketController.getFarmerEnquiries);
router.put('/enquiries/:id/status', authenticate, cropMarketController.updateEnquiryStatus);

module.exports = router;
