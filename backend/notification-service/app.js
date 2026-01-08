/*
  Notification Service - Main Application Entry Point
  
  This is the Notification Service microservice - an event-driven
  reactive service in the Library Management System.
  
  Service Responsibility:
  - Subscribe to library events via Redis Pub/Sub
  - React to events by sending notifications (simulated)
  - Log events for audit and demonstration purposes
  - Provide REST API for monitoring event processing
  
  What this service OWNS:
  - Notification logic and templates
  - Event processing logs
  - Notification preferences (future)
  
  What this service does NOT do:
  - Contain business logic (that's in Borrow Service)
  - Affect the outcome of borrow/return operations
  - Communicate back to the publisher
  
  Communication Pattern: REACTIVE
  
  This service demonstrates the "reactive" pattern:
  1. It doesn't get called directly by other services
  2. It subscribes to events and reacts when they occur
  3. The publisher (Borrow Service) doesn't know this service exists
  4. If this service is down, borrowing still works
  
  This is the "Pub/Sub" pattern - key for:
  - Loose coupling between services
  - Easy extensibility (add more subscribers)
  - Resilience (subscribers can fail independently)
  - Eventual consistency (events processed asynchronously)
  
  Port: 3004 (configurable via .env)
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notificationRoutes from "./routes/notificationRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import notificationDbRoutes from "./routes/notificationDbRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import { initializeEventSubscriber, closeEventSubscriber, isSubscriberConnected } from "./services/eventSubscriber.js";
import { initializeEmailService } from "./services/emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const SERVICE_NAME = process.env.SERVICE_NAME || "notification-service";

/*
  Middleware Setup
*/
app.use(express.json());

/*
  CORS Configuration
*/
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

/*
  Request Logging Middleware
*/
app.use((req, res, next) => {
  console.log(`[${SERVICE_NAME}] ${req.method} ${req.path}`);
  next();
});

/*
  Health Check Endpoint
  Returns service status including Redis subscription state.
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: SERVICE_NAME,
    status: "healthy",
    redisSubscription: isSubscriberConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

/*
  Notification Routes
  Endpoints for monitoring and querying processed events.
*/
app.use("/api/notifications", notificationRoutes);

/*
  Subscription Routes
  Endpoints for managing category and book subscriptions.
*/
app.use("/api/subscriptions", subscriptionRoutes);

/*
  Notification Database Routes
  Endpoints for user notifications stored in database.
*/
app.use("/api/user-notifications", notificationDbRoutes);

/*
  404 Handler
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

/*
  Centralized Error Handler
*/
app.use(errorHandler);

/*
  Initialize and Start Server
  
  Startup sequence:
  1. Initialize Email Service (SMTP)
  2. Initialize Redis subscription for events
  3. Start Express server
  
  The service will start even if Redis or SMTP is unavailable,
  but won't process events or send emails until properly configured.
*/
const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();
  
  // Initialize email service
  await initializeEmailService();
  
  // Initialize Redis subscription
  await initializeEventSubscriber();
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                NOTIFICATION SERVICE                        ║
║              (Event-Driven Reactive Service)               ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                        ║
║  Port:      ${PORT}                                           ║
║  Database:  MongoDB Connected                              ║
║  Health:    http://localhost:${PORT}/health                   ║
║  API:       http://localhost:${PORT}/api/notifications        ║
╠════════════════════════════════════════════════════════════╣
║  Event Subscription:                                       ║
║  - Channel:  library-events                                ║
║  - Redis:    ${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}                        ║
╠════════════════════════════════════════════════════════════╣
║  New Endpoints:                                            ║
║  - /api/subscriptions - Category/Book subscriptions        ║
║  - /api/user-notifications - User notifications            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
};

/*
  Graceful Shutdown Handling
*/
process.on("SIGTERM", async () => {
  console.log("[Notification Service] Received SIGTERM, shutting down gracefully...");
  await closeEventSubscriber();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Notification Service] Received SIGINT, shutting down gracefully...");
  await closeEventSubscriber();
  process.exit(0);
});

startServer();

export default app;
