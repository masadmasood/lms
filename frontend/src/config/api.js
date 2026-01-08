/* =====================
   Imports
   ===================== */
import axios from "axios";
import { getToken, clearAuth } from "@/shared/utils/auth";

// =====================
//   Microservice URLs
//  =====================
export const AUTH_URL = import.meta.env.VITE_AUTH_URL;
export const BOOKS_URL = import.meta.env.VITE_BOOKS_URL;
export const BORROW_URL = import.meta.env.VITE_BORROW_URL;
export const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL;

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =====================
   API Instance
   ===================== */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   Request Interceptor
   ===================== */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =====================
   Response Interceptor
   ===================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

/* =====================
   Default Export
   ===================== */
export default api;
