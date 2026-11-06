// FarmConnect Notifications & Real-Time Agronomic Alerts Controller (Phase 21)
const db = require('../config/database');
const crypto = require('crypto');

/**
 * GET /api/notifications
 * Fetch user notifications and unread counter
 */
function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;
    const isFarmer = req.user.role === 'FARMER';

    const notifications = isFarmer
      ? db.prepare(`
          SELECT * FROM notifications
          WHERE user_id = ? OR user_id = 'farmer_ramesh'
          ORDER BY created_at DESC
          LIMIT 50
        `).all(userId)
      : db.prepare(`
          SELECT * FROM notifications
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 50
        `).all(userId);

    const unreadCount = isFarmer
      ? db.prepare(`
          SELECT COUNT(*) as count FROM notifications
          WHERE (user_id = ? OR user_id = 'farmer_ramesh') AND is_read = 0
        `).get(userId).count
      : db.prepare(`
          SELECT COUNT(*) as count FROM notifications
          WHERE user_id = ? AND is_read = 0
        `).get(userId).count;

    return res.status(200).json({
      success: true,
      notifications,
      unread_count: unreadCount,
    });
  } catch (err) {
    console.error('getUserNotifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications for the user as read
 */
function markAllRead(req, res) {
  try {
    const userId = req.user.id;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
    `).run(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    console.error('markAllRead error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

/**
 * POST /api/notifications/send-alert
 * Trigger an agronomic/order/mandi alert notification
 */
function createAlertNotification(req, res) {
  try {
    const { user_id, title, message, type = 'SYSTEM', action_url } = req.body;

    const targetUserId = user_id || req.user.id;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notifId = 'notif_' + crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, action_url, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(notifId, targetUserId, title, message, type, action_url || null, now);

    return res.status(201).json({
      success: true,
      message: 'Alert notification dispatched.',
      notification_id: notifId,
    });
  } catch (err) {
    console.error('createAlertNotification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send alert notification.' });
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    db.prepare(`
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification removed.',
    });
  } catch (err) {
    console.error('deleteNotification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllRead,
  createAlertNotification,
  deleteNotification,
};
