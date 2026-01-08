/*
  Borrow Service - Main Entry Point
  
  Database: borrow_db
  Collection: borrows
  Port: 3002
  
  Redis Events Published:
  - BookBorrowed
  - BookReturned
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import borrowRoutes from "./routes/borrowRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import { initializeEventPublisher } from "./services/eventPublisher.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/borrows", borrowRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Redis Publisher
    await initializeEventPublisher();

    app.listen(PORT, () => {
      console.log(`

                    BORROW SERVICE                          

  Status:    Running                                        
  Port:      ${PORT}                                           
  Database:  borrow_db                                      
  Redis:     Connected (Publisher)                          
  API:       http://localhost:${PORT}/api/borrows              

      `);
    });
  } catch (error) {
    console.error("[Borrow Service] Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
