import axios from "axios";
import { AUTH_URL } from "@/config/api";

/**
 * Auth Service - All API calls related to authentication
 */
export const authService = {
  /**
   * Login user with credentials
   * @param {Object} credentials - User credentials
   * @param {string} credentials.loginId - User login ID (email)
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response with user data
   */
  login: async (credentials) => {
    const response = await axios.post(`${AUTH_URL}/auth/login`, credentials);
    // Return both data and headers in case token is in headers
    return {
      data: response.data,
      headers: response.headers,
    };
  },

  /**
   * Logout user - Clear local storage
   */
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },
};

export default authService;

