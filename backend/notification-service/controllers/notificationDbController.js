/*
  Notification Controller
  
  Handles all notification-related operations:
  - Get user notifications
  - Mark notification as read
  - Mark all as read
  - Delete notification
  - Create notification (internal use)
*/

import Notification from "../models/Notification.js";
import { v4 as uuidv4 } from "uuid";

/*
  Get notifications for a user
*/
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required"
      });
    }

    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get unread notification count for a user
*/
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required"
      });
    }

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Mark a notification as read
*/
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const notification = await Notification.findOne({ notificationId, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found"
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Mark all notifications as read for a user
*/
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required"
      });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Delete a notification
*/
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const notification = await Notification.findOneAndDelete({ notificationId, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
      data: { notificationId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Delete all notifications for a user
*/
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required"
      });
    }

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Create a notification (internal use)
  This function is exported for use by event handlers
*/
export const createNotification = async ({
  userId,
  userEmail,
  type,
  title,
  message,
  relatedBookId = null,
  relatedBookTitle = null,
  relatedCategoryId = null,
  relatedCategoryName = null,
  metadata = {},
  priority = 'normal'
}) => {
  try {
    const notification = new Notification({
      notificationId: `NOTIF-${Date.now()}-${uuidv4().split('-')[0]}`,
      userId,
      userEmail,
      type,
      title,
      message,
      relatedBookId,
      relatedBookTitle,
      relatedCategoryId,
      relatedCategoryName,
      metadata,
      priority
    });

    await notification.save();
    console.log(`[Notification Controller] Created notification for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('[Notification Controller] Error creating notification:', error.message);
    return null;
  }
};

/*
  Create notifications for multiple users (batch)
  Used when notifying all subscribers of a category/book
*/
export const createBatchNotifications = async (subscribers, notificationData) => {
  try {
    const notifications = subscribers.map(sub => ({
      notificationId: `NOTIF-${Date.now()}-${uuidv4().split('-')[0]}`,
      userId: sub.userId,
      userEmail: sub.userEmail,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedBookId: notificationData.relatedBookId || null,
      relatedBookTitle: notificationData.relatedBookTitle || null,
      relatedCategoryId: notificationData.relatedCategoryId || null,
      relatedCategoryName: notificationData.relatedCategoryName || null,
      metadata: notificationData.metadata || {},
      priority: notificationData.priority || 'normal'
    }));

    const result = await Notification.insertMany(notifications);
    console.log(`[Notification Controller] Created ${result.length} batch notifications`);
    return result;
  } catch (error) {
    console.error('[Notification Controller] Error creating batch notifications:', error.message);
    return [];
  }
};
