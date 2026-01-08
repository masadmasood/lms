/*
  Notification Service Routes
  
  This file defines the REST API endpoints for the Notification Service.
  
  These endpoints are primarily for monitoring and debugging, as the
  main functionality of this service is event-driven via Redis Pub/Sub.
  
  Route Structure:
  - GET /api/notifications/status         - Get service status
  - GET /api/notifications/events         - Get all processed events
  - GET /api/notifications/events/:type   - Get events by type
*/

import express from "express";
import {
  getAllEvents,
  getServiceStatus,
  getEventsByType
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/status", getServiceStatus);
router.get("/events", getAllEvents);
router.get("/events/:type", getEventsByType);

export default router;
