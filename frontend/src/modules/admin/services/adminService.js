import api, { BOOKS_URL, AUTH_URL } from "@/config/api";

/**
 * Admin Service - All API calls related to admin management
 */
export const adminService = {
  /**
   * Add a new student user
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student
   */
  addStudent: async (studentData) => {
    const response = await api.post(`${AUTH_URL}/auth/register`, studentData);
    return response.data;
  },

  /**
   * Get all students
   * @returns {Promise<Array>} Array of students
   */
  getAllStudents: async () => {
    const response = await api.get(`${AUTH_URL}/auth/students`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch students");
  },

  /**
   * Delete a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteStudent: async (studentId) => {
    const response = await api.delete(`${AUTH_URL}/auth/students/${studentId}`);
    return response.data;
  },

  /**
   * Add a new book to the catalog
   * @param {Object} bookData - Book data
   * @returns {Promise<Object>} Created book
   */
  addBook: async (bookData) => {
    const response = await api.post(`${BOOKS_URL}/api/books`, bookData);
    return response.data;
  },

  /**
   * Update an existing book
   * @param {string} bookId - Book ID
   * @param {Object} bookData - Updated book data
   * @returns {Promise<Object>} Updated book
   */
  updateBook: async (bookId, bookData) => {
    const response = await api.put(`${BOOKS_URL}/api/books/${bookId}`, bookData);
    return response.data;
  },

  /**
   * Delete a book from the catalog
   * @param {string} bookId - Book ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteBook: async (bookId) => {
    const response = await api.delete(`${BOOKS_URL}/api/books/${bookId}`);
    return response.data;
  },

  /**
   * Get all books (for admin management)
   * @returns {Promise<Array>} Array of books
   */
  getAllBooks: async () => {
    const response = await api.get(`${BOOKS_URL}/api/books`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch books");
  },
};

export default adminService;
