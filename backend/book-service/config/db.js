import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/books_db';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[Book Service] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[Book Service] Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('[Book Service] MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;

