/*
  Category Subscription Model
  
  Stores user subscriptions to book categories.
  When a book of this category is added, user gets notified.
*/

import mongoose from 'mongoose';

const categorySubscriptionSchema = new mongoose.Schema({
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
  categoryId: {
    type: String,
    required: true,
    index: true
  },
  categoryName: {
    type: String,
    required: true
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
  collection: 'category_subscriptions'
});

// Compound index to ensure unique subscription per user per category
categorySubscriptionSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

// Index for finding all subscribers of a category
categorySubscriptionSchema.index({ categoryId: 1, isActive: 1 });

const CategorySubscription = mongoose.model('CategorySubscription', categorySubscriptionSchema);

export default CategorySubscription;
