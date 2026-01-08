/*
  Notification Service
  
  Frontend service for fetching user notifications from database.
*/

import api, { NOTIFICATION_URL } from "@/config/api";

const NOTIFICATION_BASE = `${NOTIFICATION_URL}/api/user-notifications`;

export const notificationService = {
  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options {page, limit, unreadOnly}
   * @returns {Promise<Object>} Notifications with pagination
   */
  getUserNotifications: async (userId, options = {}) => {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const response = await api.get(`${NOTIFICATION_BASE}/user/${userId}`, {
      params: { page, limit, unreadOnly }
    });
    return response.data;
  },

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Unread count
   */
  getUnreadCount: async (userId) => {
    const response = await api.get(`${NOTIFICATION_BASE}/user/${userId}/unread-count`);
    return response.data;
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  markAsRead: async (notificationId, userId) => {
    const response = await api.put(`${NOTIFICATION_BASE}/${notificationId}/read`, { userId });
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  markAllAsRead: async (userId) => {
    const response = await api.put(`${NOTIFICATION_BASE}/mark-all-read`, { userId });
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteNotification: async (notificationId, userId) => {
    const response = await api.delete(`${NOTIFICATION_BASE}/${notificationId}`, { 
      data: { userId } 
    });
    return response.data;
  },

  /**
   * Delete all notifications
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteAllNotifications: async (userId) => {
    const response = await api.delete(`${NOTIFICATION_BASE}/delete-all`, { 
      data: { userId } 
    });
    return response.data;
  }
};

export default notificationService;
