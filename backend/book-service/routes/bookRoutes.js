/*
  Book Service Routes
  
  This file defines the REST API endpoints for the Book Service.
  
  Route Structure:
  - GET  /api/books                    - List all books (supports query filters)
  - GET  /api/books?status=available    - Filter by status (available/unavailable)
  - GET  /api/books?category=Technology - Filter by category
  - GET  /api/books?author=Robert       - Filter by author
  - GET  /api/books?search=clean        - Search in title/author/description
  - GET  /api/books/:id                 - Get specific book by ID
  - PATCH /api/books/:id/decrease       - Decrease copies (called by Borrow Service on issue)
  - PATCH /api/books/:id/increase       - Increase copies (called by Borrow Service on return)
  
  Query Parameters Examples:
  - /api/books?status=available
  - /api/books?status=available&category=Technology
  - /api/books?search=code&status=available
  - /api/books?author=Robert&category=Technology
  
  Design Decision:
  We use PATCH for decrease/increase operations because they partially update
  the book resource (only the availableCopies field).
  
  These routes are the ONLY way other services can interact with book data.
  This enforces the microservices principle of service autonomy.
*/

import express from "express";
import {
  getAllBooks,
  getBookById,
  decreaseAvailableCopies,
  increaseAvailableCopies,
  addBook,
  deleteBook,
  updateBook
} from "../controllers/bookController.js";

const router = express.Router();

// Public routes
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Admin routes (book management)
router.post("/", addBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

// Internal routes (called by Borrow Service)
router.patch("/:id/decrease", decreaseAvailableCopies);
router.patch("/:id/increase", increaseAvailableCopies);

export default router;
