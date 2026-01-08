import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  bookId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  borrowerName: {
    type: String,
    default: null
  },
  borrowDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['BORROWED', 'RETURNED'],
    default: 'BORROWED',
    index: true
  }
}, {
  timestamps: true,
  collection: 'borrows' // Collection name: borrows
});

// Compound index for efficient queries
borrowSchema.index({ email: 1, status: 1 });
borrowSchema.index({ userId: 1, bookId: 1, status: 1 });

const Borrow = mongoose.model('Borrow', borrowSchema);

export default Borrow;

