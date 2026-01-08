import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  language: [{
    type: String
  }],
  pages: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coverImageUrl: {
    type: String,
    required: true
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  }
}, {
  timestamps: true,
  collection: 'books' // Collection name: books
});

const Book = mongoose.model('Book', bookSchema);

export default Book;

