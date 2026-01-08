import api, { BOOKS_URL, BORROW_URL } from "@/config/api";

/**
 * Book Service - All API calls related to books
 */
export const bookService = {
  /**
   * Fetch all books from the API
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status ('available' | 'unavailable')
   * @param {string} filters.category - Filter by category
   * @param {string} filters.author - Filter by author
   * @param {string} filters.search - Search in title/author/description
   * @returns {Promise<Array>} Array of book objects
   */
  getBooks: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.author) params.append('author', filters.author);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `${BOOKS_URL}/api/books${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch books");
  },

  /**
   * Fetch a single book by ID
   * @param {string} bookId - The book ID
   * @returns {Promise<Object>} Book object
   */
  getBookById: async (bookId) => {
    const response = await api.get(`${BOOKS_URL}/api/books/${bookId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch book");
  },

  /**
   * Submit a borrow request
   * @param {Object} borrowData - Borrow request data
   * @param {string} borrowData.userId - User ID from localStorage
   * @param {string} borrowData.bookId - Book ID to borrow
   * @param {string} borrowData.email - Email of borrower
   * @param {number} borrowData.borrowDuration - Duration in days (optional)
   * @returns {Promise<Object>} Borrow response
   */
  borrowBook: async (borrowData) => {
    const response = await api.post(`${BORROW_URL}/api/borrows`, borrowData);
    return response.data;
  },
};

export default bookService;

