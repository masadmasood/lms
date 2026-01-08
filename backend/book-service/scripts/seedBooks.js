import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-books';

const seedBooks = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read booksData.json from client folder
    const booksDataPath = join(__dirname, '../../../client/src/shared/constants/booksData.json');
    const booksData = JSON.parse(readFileSync(booksDataPath, 'utf-8'));

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert books from booksData
    const books = await Book.insertMany(booksData);
    console.log(`Seeded ${books.length} books successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

seedBooks();

