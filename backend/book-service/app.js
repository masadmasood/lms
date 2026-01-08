/*
  Book Service - Main Application Entry Point
  
  This is the Book Service microservice for the Library Management System.
  
  Service Responsibility:
  - Manages the book catalog (CRUD operations on books)
  - Tracks book availability (available copies)
  - Provides REST API for book operations
  
  What this service OWNS:
  - All book data (titles, authors, ISBNs, copy counts)
  - Book availability state
  
  What this service does NOT know about:
  - Members (handled by Member Service)
  - Borrowing records (handled by Borrow Service)
  - Who is borrowing books or why
  
  Communication:
  - Exposes REST API on PORT 3001 (configurable via .env)
  - Called by Borrow Service to check/update book availability
  - Does NOT call any other service (leaf service in the architecture)
  
  This service can be started, stopped, and deployed independently
  without affecting other services in the system.
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import { initSubscriber } from "./services/eventSubscriber.js";
import { initPublisher, setBroadcastFunction } from "./services/eventPublisher.js";
import Category from "./models/Category.js";
import Book from "./models/Book.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME || "book-service";

/*
  CORS Configuration
  - Allows requests from frontend (localhost:5173)
  - Required for cross-origin API calls
*/
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

/*
  Middleware Setup
  - express.json() parses incoming JSON request bodies
  - This is required for POST/PUT/PATCH requests with JSON payloads
*/
app.use(express.json());

/*
  Request Logging Middleware
  Logs all incoming requests for debugging and monitoring purposes.
  In production, this would be replaced with a proper logging library.
*/
app.use((req, res, next) => {
  console.log(`[${SERVICE_NAME}] ${req.method} ${req.path}`);
  next();
});

/*
  Health Check Endpoint
  Used for:
  - Load balancer health checks
  - Container orchestration (Kubernetes) readiness probes
  - Monitoring systems
  - Other services to verify this service is running
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: SERVICE_NAME,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

/*
  Book Routes
  All book-related endpoints are prefixed with /api/books
  This keeps the API organized and versioning-friendly
*/
app.use("/api/books", bookRoutes);

/*
  Category Routes
  All category-related endpoints are prefixed with /api/categories
*/
app.use("/api/categories", categoryRoutes);

/*
  Server-Sent Events (SSE) for Real-Time Notifications
  Students subscribe to this endpoint to get notified when books are added/updated/deleted
*/
const sseClients = new Set();

app.get("/api/notifications/stream", (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", message: "Connected to notifications" })}\n\n`);

  // Add client to set
  sseClients.add(res);
  console.log(`[Book Service] SSE client connected. Total: ${sseClients.size}`);

  // Remove client on close
  req.on("close", () => {
    sseClients.delete(res);
    console.log(`[Book Service] SSE client disconnected. Total: ${sseClients.size}`);
  });
});

// Function to broadcast to all SSE clients
const broadcastNotification = (notification) => {
  const message = `data: ${JSON.stringify(notification)}\n\n`;
  sseClients.forEach((client) => {
    client.write(message);
  });
  console.log(`[Book Service] Broadcasted notification to ${sseClients.size} clients`);
};

// Export for use in eventPublisher
setBroadcastFunction(broadcastNotification);

/*
  404 Handler
  Catches requests to undefined routes
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

/*
  Centralized Error Handler
  Must be the last middleware to catch all errors
*/
app.use(errorHandler);

/*
  Start the Server
  Connect to MongoDB and Redis, then start listening
*/
const syncCategoriesFromBooks = async () => {
  try {
    // Get all unique categories from books
    const uniqueCategories = await Book.distinct('category');
    
    let created = 0;
    let updated = 0;

    for (const categoryName of uniqueCategories) {
      if (!categoryName) continue;
      
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
      });

      const bookCount = await Book.countDocuments({ 
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
      });

      if (existingCategory) {
        existingCategory.bookCount = bookCount;
        await existingCategory.save();
        updated++;
      } else {
        const categoryId = `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const newCategory = new Category({
          categoryId,
          name: categoryName,
          bookCount
        });
        
        await newCategory.save();
        created++;
      }
    }

    console.log(`[Book Service] Categories synced: ${created} created, ${updated} updated`);
  } catch (error) {
    console.error("[Book Service] Failed to sync categories:", error.message);
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Sync categories from existing books
    await syncCategoriesFromBooks();

    // Initialize Redis subscriber for events from Borrow Service
    await initSubscriber();

    // Initialize Redis publisher for BookAdded/Deleted events
    await initPublisher();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                     BOOK SERVICE                           ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                        ║
║  Port:      ${PORT}                                           ║
║  Database:  book_service_db                                ║
║  Redis:     Connected (Pub/Sub)                            ║
║  API:       http://localhost:${PORT}/api/books                ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("[Book Service] Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
