/*
  Subscription Routes
  
  Routes for managing subscriptions:
  - POST /api/subscriptions/category/subscribe - Subscribe to category
  - POST /api/subscriptions/category/unsubscribe - Unsubscribe from category
  - POST /api/subscriptions/book/subscribe - Subscribe to book
  - POST /api/subscriptions/book/unsubscribe - Unsubscribe from book
  - GET /api/subscriptions/user/:userId - Get all user subscriptions
  - GET /api/subscriptions/category/:categoryId/check/:userId - Check category subscription
  - GET /api/subscriptions/book/:bookId/check/:userId - Check book subscription
  - GET /api/subscriptions/category/:categoryId/subscribers - Get category subscribers
  - GET /api/subscriptions/book/:bookId/subscribers - Get book subscribers
*/

import express from 'express';
import {
  subscribeToCategory,
  unsubscribeFromCategory,
  subscribeToBook,
  unsubscribeFromBook,
  getUserSubscriptions,
  checkCategorySubscription,
  checkBookSubscription,
  getCategorySubscribers,
  getBookSubscribers
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Category subscription routes
router.post('/category/subscribe', subscribeToCategory);
router.post('/category/unsubscribe', unsubscribeFromCategory);

// Book subscription routes
router.post('/book/subscribe', subscribeToBook);
router.post('/book/unsubscribe', unsubscribeFromBook);

// User subscriptions
router.get('/user/:userId', getUserSubscriptions);

// Check subscription status
router.get('/category/:categoryId/check/:userId', checkCategorySubscription);
router.get('/book/:bookId/check/:userId', checkBookSubscription);

// Get subscribers (for admin/internal use)
router.get('/category/:categoryId/subscribers', getCategorySubscribers);
router.get('/book/:bookId/subscribers', getBookSubscribers);

export default router;
