// FarmConnect Notification Routes (Phase 21)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All notification operations require authentication
router.use(authenticate);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Mark single notification read
router.put('/:id/read', notificationController.markAsRead);

// Mark all read
router.put('/mark-all-read', notificationController.markAllRead);

// Dispatch alert notification
router.post('/send-alert', notificationController.createAlertNotification);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
