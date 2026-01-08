/*
  Category Model
  
  Stores all book categories/genres in the system.
  Categories are managed by admins and used for subscription system.
*/

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📚' // Default emoji icon
  },
  color: {
    type: String,
    default: '#6366f1' // Default color (indigo)
  },
  bookCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'categories'
});

// Index for faster searches
categorySchema.index({ name: 'text', description: 'text' });

const Category = mongoose.model('Category', categorySchema);

export default Category;
