import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Default admin users to seed
const defaultUsers = [
  {
    username: "admin.abdullah",
    email: "admin.abdullah.lms@mailinator.com",
    password: "admin123",
    role: "admin"
  },
  {
    username: "admin.nasir",
    email: "admin.nasir.lms@mailinator.com",
    password: "admin123",
    role: "admin"
  },
  {
    username: "admin.asad",
    email: "admin.asad.lms@mailinator.com",
    password: "admin123",
    role: "admin"
  }
];

// Seed default users if they don't exist
const seedUsers = async () => {
  try {
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username }, 
          { email: userData.email }
        ] 
      });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`[Auth Service] Created default user: ${userData.username}`);
      } else {
        console.log(`[Auth Service] User already exists: ${userData.username}`);
      }
    }
    console.log("[Auth Service] User seeding completed");
  } catch (error) {
    console.error("[Auth Service] Error seeding users:", error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[Auth Service] MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default users after connection
    await seedUsers();
  } catch (error) {
    console.error("[Auth Service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
