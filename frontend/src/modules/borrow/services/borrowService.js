import api, { BORROW_URL } from "@/config/api";

/**
 * Borrow Service - All API calls related to borrowing books
 */
export const borrowService = {
  /**
   * Issue/borrow a book
   * @param {Object} borrowData - Borrow request data
   * @param {string} borrowData.userId - User ID from localStorage
   * @param {string} borrowData.email - User email
   * @param {string} borrowData.bookId - Book ID to borrow
   * @param {number} borrowData.borrowDuration - Duration in days (optional, default 14)
   * @returns {Promise<Object>} Borrow response
   */
  borrowBook: async (borrowData) => {
    const response = await api.post(`${BORROW_URL}/api/borrows`, borrowData);
    return response.data;
  },

  /**
   * Return a borrowed book
   * @param {string} borrowId - Borrow record ID
   * @returns {Promise<Object>} Return response
   */
  returnBook: async (borrowId) => {
    const response = await api.patch(`${BORROW_URL}/api/borrows/${borrowId}/return`);
    return response.data;
  },

  /**
   * Get all borrow records
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status ('BORROWED' | 'RETURNED')
   * @param {string} filters.email - Filter by user email
   * @returns {Promise<Array>} Array of borrow records
   */
  getBorrowRecords: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Backend uses uppercase status: 'BORROWED' or 'RETURNED'
    if (filters.status) {
      const normalizedStatus = filters.status.toUpperCase();
      params.append('status', normalizedStatus);
    }
    if (filters.email) params.append('email', filters.email);
    
    const queryString = params.toString();
    const url = `${BORROW_URL}/api/borrows${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch borrow records");
  },

  /**
   * Get user's borrow history by email
   * @param {string} email - User email
   * @returns {Promise<Array>} Array of borrow records
   */
  getUserBorrowHistory: async (email) => {
    const response = await api.get(`${BORROW_URL}/api/borrows/user/${encodeURIComponent(email)}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch borrow history");
  },

  /**
   * Get borrow record by ID
   * @param {string} borrowId - Borrow record ID
   * @returns {Promise<Object>} Borrow record
   */
  getBorrowRecordById: async (borrowId) => {
    const response = await api.get(`${BORROW_URL}/api/borrows/${borrowId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch borrow record");
  },
};

export default borrowService;

