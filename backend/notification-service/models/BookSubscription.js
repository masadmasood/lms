/*
  Book Subscription Model
  
  Stores user subscriptions to specific books.
  When updates happen to this book, user gets notified.
*/

import mongoose from 'mongoose';

const bookSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  bookId: {
    type: String,
    required: true,
    index: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookCategory: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'book_subscriptions'
});

// Compound index to ensure unique subscription per user per book
bookSubscriptionSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Index for finding all subscribers of a book
bookSubscriptionSchema.index({ bookId: 1, isActive: 1 });

const BookSubscription = mongoose.model('BookSubscription', bookSubscriptionSchema);

export default BookSubscription;
