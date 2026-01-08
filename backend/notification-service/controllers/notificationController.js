/*
  Notification Controller
  
  This controller provides REST endpoints for the Notification Service.
  
  Note: This service is primarily event-driven, but we expose REST
  endpoints for:
  1. Viewing the event log (for debugging/demonstration)
  2. Checking service status
  3. Future: Manual notification triggers (admin functions)
  
  In production, this might expose:
  - Admin endpoints to resend notifications
  - Endpoints to query notification history
  - Endpoints to manage notification preferences
*/

import { getEventLog } from "../services/eventHandlers.js";
import { isSubscriberConnected } from "../services/eventSubscriber.js";

/*
  Get all processed events
  Returns the in-memory log of all events processed by this service.
  Useful for demonstration and debugging.
*/
export const getAllEvents = (req, res) => {
  const eventLog = getEventLog();
  
  res.status(200).json({
    success: true,
    count: eventLog.length,
    data: eventLog
  });
};

/*
  Get service status
  Returns detailed status including subscription state.
*/
export const getServiceStatus = (req, res) => {
  const eventLog = getEventLog();
  
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME || "notification-service",
    status: "running",
    redisSubscription: isSubscriberConnected() ? "connected" : "disconnected",
    statistics: {
      totalEventsProcessed: eventLog.length,
      bookIssuedEvents: eventLog.filter(e => e.eventType === "BOOK_ISSUED").length,
      bookReturnedEvents: eventLog.filter(e => e.eventType === "BOOK_RETURNED").length
    },
    timestamp: new Date().toISOString()
  });
};

/*
  Get events by type
  Filter events by their type (BOOK_ISSUED, BOOK_RETURNED, etc.)
*/
export const getEventsByType = (req, res) => {
  const { type } = req.params;
  const eventLog = getEventLog();
  const filteredEvents = eventLog.filter(e => e.eventType === type.toUpperCase());
  
  res.status(200).json({
    success: true,
    eventType: type.toUpperCase(),
    count: filteredEvents.length,
    data: filteredEvents
  });
};
