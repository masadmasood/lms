/*
  Notification Model
  
  Stores user-specific notifications with read/unread status.
  Notifications are created when:
  - New book is added in a subscribed category
  - Subscribed book is updated
  - Book is borrowed/returned
*/

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'BOOK_ADDED',           // New book in subscribed category
      'BOOK_UPDATED',         // Subscribed book updated
      'BOOK_AVAILABLE',       // Subscribed book now available
      'BOOK_BORROWED',        // User borrowed a book
      'BOOK_RETURNED',        // User returned a book
      'DUE_DATE_REMINDER',    // Due date approaching
      'OVERDUE_NOTICE',       // Book is overdue
      'CATEGORY_UPDATE',      // Category info updated
      'SYSTEM'                // System notifications
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Related entity information
  relatedBookId: {
    type: String,
    default: null
  },
  relatedBookTitle: {
    type: String,
    default: null
  },
  relatedCategoryId: {
    type: String,
    default: null
  },
  relatedCategoryName: {
    type: String,
    default: null
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Expiry (optional - for temporary notifications)
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound index for fetching user notifications
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// TTL index for auto-deleting expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
