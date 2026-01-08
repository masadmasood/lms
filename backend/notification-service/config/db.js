/*
  Database Configuration for Notification Service
  
  Connects to MongoDB for storing:
  - Category subscriptions
  - Book subscriptions
  - User notifications
*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications_db';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[Notification Service] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[Notification Service] Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('[Notification Service] MongoDB connection error:', error.message);
    // Don't exit - service can work without DB for some features
    return false;
  }
  return true;
};

export default connectDB;
