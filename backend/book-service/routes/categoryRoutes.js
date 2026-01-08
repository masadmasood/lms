/*
  Category Routes
  
  Routes for category management:
  - GET /api/categories - Get all categories
  - GET /api/categories/:id - Get category by ID
  - POST /api/categories - Create category (Admin only)
  - PUT /api/categories/:id - Update category (Admin only)
  - DELETE /api/categories/:id - Delete category (Admin only)
  - POST /api/categories/sync - Sync categories from existing books
*/

import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  syncCategoriesFromBooks
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (TODO: Add admin middleware)
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

// Utility route for syncing
router.post('/sync', syncCategoriesFromBooks);

export default router;
