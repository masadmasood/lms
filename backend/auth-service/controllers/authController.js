import User from "../models/User.js";
import { createClient } from "redis";

// Redis client for publishing events
let redisClient = null;
let isRedisConnected = false;

// Initialize Redis connection
const initializeRedisPublisher = async () => {
  if (redisClient && isRedisConnected) return true;
  
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379"
    });

    redisClient.on("error", (err) => {
      console.error("[Auth Service] Redis Publisher Error:", err.message);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("[Auth Service] Redis Publisher connected");
      isRedisConnected = true;
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.warn("[Auth Service] Failed to connect Redis Publisher:", error.message);
    redisClient = null;
    isRedisConnected = false;
    return false;
  }
};

// Initialize Redis on module load
initializeRedisPublisher();

// Publish user deleted event
const publishUserDeleted = async (data) => {
  if (!isRedisConnected || !redisClient) {
    console.log("[Auth Service] Redis not connected. UserDeleted event not published.");
    return false;
  }

  try {
    const event = JSON.stringify({
      userId: data.userId,
      username: data.username,
      email: data.email,
      deletedBy: data.deletedBy,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish("UserDeleted", event);
    console.log(`[Auth Service] Published UserDeleted event for user: ${data.username}`);
    return true;
  } catch (error) {
    console.error("[Auth Service] Failed to publish UserDeleted:", error.message);
    return false;
  }
};

// Basic login: loginId (email or username) + password, DB-driven
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    const normalizedLoginId = (loginId || "").trim().toLowerCase();

    // Validate input
    if (!normalizedLoginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required",
      });
    }

    // Fetch user from MongoDB (users collection) by email OR username
    const user = await User.findOne({
      $or: [{ email: normalizedLoginId }, { username: normalizedLoginId }],
    });

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Verify password (plain text, no bcrypt)
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Successful login - return user object (without password)
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Register new user (Admin can add students)
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user (only students can be added, not admin)
    const newUser = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: password, // Plain text (no bcrypt as per requirements)
      role: role === "admin" ? "student" : (role || "student"), // Force student role, admin cannot be created
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Get all students (Admin only)
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching students",
      error: error.message,
    });
  }
};

// Delete a student (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user first
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    // Publish UserDeleted event for email notification
    await publishUserDeleted({
      userId: user._id,
      username: user.username,
      email: user.email,
      deletedBy: "admin",
    });

    return res.json({
      success: true,
      message: "Student deleted successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error deleting student",
      error: error.message,
    });
  }
};
