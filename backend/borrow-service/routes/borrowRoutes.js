/*
  Borrow Service Routes
  
  Routes:
  - POST   /api/borrows              - Borrow a book
  - PATCH  /api/borrows/:borrowId/return - Return a book
  - GET    /api/borrows              - Get all borrow records
  - GET    /api/borrows/:borrowId    - Get borrow by ID
  - GET    /api/borrows/user/:email  - Get user borrow history
*/

import express from "express";
import {
  borrowBook,
  returnBook,
  getAllBorrows,
  getBorrowById,
  getUserBorrowHistory
} from "../controllers/borrowController.js";

const router = express.Router();

// Borrow a book - POST /api/borrows
router.post("/", borrowBook);

// Return a book - PATCH /api/borrows/:borrowId/return
router.patch("/:borrowId/return", returnBook);

// Get all borrows - GET /api/borrows
router.get("/", getAllBorrows);

// Get user history - GET /api/borrows/user/:email
router.get("/user/:email", getUserBorrowHistory);

// Get borrow by ID - GET /api/borrows/:borrowId
router.get("/:borrowId", getBorrowById);

export default router;
