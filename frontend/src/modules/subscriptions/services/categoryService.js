/*
  Category Service
  
  Frontend service for fetching categories from the book-service API.
*/

import api, { BOOKS_URL } from "@/config/api";

const CATEGORY_BASE = `${BOOKS_URL}/api/categories`;

export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Array>} List of categories
   */
  getAllCategories: async () => {
    const response = await api.get(CATEGORY_BASE);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch categories");
  },

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category details
   */
  getCategoryById: async (categoryId) => {
    const response = await api.get(`${CATEGORY_BASE}/${categoryId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch category");
  },

  /**
   * Create a new category (Admin only)
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (categoryData) => {
    const response = await api.post(CATEGORY_BASE, categoryData);
    return response.data;
  },

  /**
   * Update a category (Admin only)
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated data
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`${CATEGORY_BASE}/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete a category (Admin only)
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`${CATEGORY_BASE}/${categoryId}`);
    return response.data;
  },

  /**
   * Sync categories from existing books
   * @returns {Promise<Object>} Sync result
   */
  syncCategories: async () => {
    const response = await api.post(`${CATEGORY_BASE}/sync`);
    return response.data;
  }
};

export default categoryService;
