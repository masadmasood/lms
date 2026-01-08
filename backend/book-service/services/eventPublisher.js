/*
  Event Publisher for Book Service
  
  Publishes events when books are added or deleted.
  Students subscribed to these events will get real-time notifications.
*/

import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let publisher = null;
let broadcastFn = null;

// Set broadcast function from app.js
export const setBroadcastFunction = (fn) => {
  broadcastFn = fn;
};

// Initialize Redis publisher
export const initPublisher = async () => {
  try {
    publisher = createClient({ url: REDIS_URL });

    publisher.on("error", (err) => {
      console.error("[Book Service] Redis Publisher Error:", err);
    });

    await publisher.connect();
    console.log("[Book Service] Redis Publisher connected");
  } catch (error) {
    console.error("[Book Service] Failed to connect Redis Publisher:", error.message);
  }
};

// Publish BookAdded event
export const publishBookAdded = async (bookData) => {
  try {
    if (!publisher) {
      console.error("[Book Service] Publisher not initialized");
      return;
    }

    const notification = {
      type: "BookAdded",
      timestamp: new Date().toISOString(),
      data: bookData
    };

    const message = JSON.stringify(notification);

    await publisher.publish("BookAdded", message);
    console.log(`[Book Service] Published BookAdded event: ${bookData.title}`);

    // Broadcast to SSE clients
    if (broadcastFn) {
      broadcastFn(notification);
    }
  } catch (error) {
    console.error("[Book Service] Failed to publish BookAdded:", error.message);
  }
};

// Publish BookDeleted event
export const publishBookDeleted = async (bookData) => {
  try {
    if (!publisher) {
      console.error("[Book Service] Publisher not initialized");
      return;
    }

    const notification = {
      type: "BookDeleted",
      timestamp: new Date().toISOString(),
      data: bookData
    };

    const message = JSON.stringify(notification);

    await publisher.publish("BookDeleted", message);
    console.log(`[Book Service] Published BookDeleted event: ${bookData.title}`);

    // Broadcast to SSE clients
    if (broadcastFn) {
      broadcastFn(notification);
    }
  } catch (error) {
    console.error("[Book Service] Failed to publish BookDeleted:", error.message);
  }
};

// Publish BookUpdated event
export const publishBookUpdated = async (bookData) => {
  try {
    if (!publisher) {
      console.error("[Book Service] Publisher not initialized");
      return;
    }

    const notification = {
      type: "BookUpdated",
      timestamp: new Date().toISOString(),
      data: bookData
    };

    const message = JSON.stringify(notification);

    await publisher.publish("BookUpdated", message);
    console.log(`[Book Service] Published BookUpdated event: ${bookData.title}`);

    // Broadcast to SSE clients
    if (broadcastFn) {
      broadcastFn(notification);
    }
  } catch (error) {
    console.error("[Book Service] Failed to publish BookUpdated:", error.message);
  }
};

export default { initPublisher, publishBookAdded, publishBookDeleted, publishBookUpdated, setBroadcastFunction };
