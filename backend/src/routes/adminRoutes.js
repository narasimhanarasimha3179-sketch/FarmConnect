// FarmConnect Admin Routes
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes require authenticated ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Platform dashboard summary
router.get('/dashboard', adminController.getDashboard);

// User Governance
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Seller Verification & Management
router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/verify', adminController.verifySeller);

// Complaints & Dispute Management
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', adminController.updateComplaint);

// System Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Mandi Price Oversight
router.get('/mandi-prices', adminController.getMandiPrices);
router.post('/mandi-prices', adminController.upsertMandiPrice);

// Agricultural Emergency Broadcast & MSP Governance
router.post('/broadcast-alert', adminController.broadcastEmergencyAlert);
router.get('/msp-compliance', adminController.getMspComplianceReport);

module.exports = router;
