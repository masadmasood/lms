/*
  Subscription Service
  
  Frontend service for managing category and book subscriptions.
  All data is fetched from the notification-service backend API.
*/

import api, { NOTIFICATION_URL } from "@/config/api";

const SUBSCRIPTION_BASE = `${NOTIFICATION_URL}/api/subscriptions`;

export const subscriptionService = {
  /**
   * Subscribe to a category
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} Subscription result
   */
  subscribeToCategory: async (data) => {
    const response = await api.post(`${SUBSCRIPTION_BASE}/category/subscribe`, data);
    return response.data;
  },

  /**
   * Unsubscribe from a category
   * @param {Object} data - Unsubscription data {userId, categoryId}
   * @returns {Promise<Object>} Unsubscription result
   */
  unsubscribeFromCategory: async (data) => {
    const response = await api.post(`${SUBSCRIPTION_BASE}/category/unsubscribe`, data);
    return response.data;
  },

  /**
   * Subscribe to a book
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} Subscription result
   */
  subscribeToBook: async (data) => {
    const response = await api.post(`${SUBSCRIPTION_BASE}/book/subscribe`, data);
    return response.data;
  },

  /**
   * Unsubscribe from a book
   * @param {Object} data - Unsubscription data {userId, bookId}
   * @returns {Promise<Object>} Unsubscription result
   */
  unsubscribeFromBook: async (data) => {
    const response = await api.post(`${SUBSCRIPTION_BASE}/book/unsubscribe`, data);
    return response.data;
  },

  /**
   * Get all subscriptions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User subscriptions {categories: [], books: []}
   */
  getUserSubscriptions: async (userId) => {
    const response = await api.get(`${SUBSCRIPTION_BASE}/user/${userId}`);
    return response.data;
  },

  /**
   * Check if user is subscribed to a category
   * @param {string} userId - User ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Subscription status
   */
  checkCategorySubscription: async (userId, categoryId) => {
    const response = await api.get(`${SUBSCRIPTION_BASE}/category/${categoryId}/check/${userId}`);
    return response.data;
  },

  /**
   * Check if user is subscribed to a book
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @returns {Promise<Object>} Subscription status
   */
  checkBookSubscription: async (userId, bookId) => {
    const response = await api.get(`${SUBSCRIPTION_BASE}/book/${bookId}/check/${userId}`);
    return response.data;
  }
};

export default subscriptionService;
