/*
  Notification Database Routes
  
  Routes for managing notifications stored in database:
  - GET /api/notifications/user/:userId - Get user notifications
  - GET /api/notifications/user/:userId/unread-count - Get unread count
  - PUT /api/notifications/:notificationId/read - Mark as read
  - PUT /api/notifications/mark-all-read - Mark all as read
  - DELETE /api/notifications/:notificationId - Delete notification
  - DELETE /api/notifications/delete-all - Delete all user notifications
*/

import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notificationDbController.js';

const router = express.Router();

// Get user notifications
router.get('/user/:userId', getUserNotifications);

// Get unread count
router.get('/user/:userId/unread-count', getUnreadCount);

// Mark as read
router.put('/:notificationId/read', markAsRead);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Delete all notifications
router.delete('/delete-all', deleteAllNotifications);

export default router;
