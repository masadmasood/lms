/*
  Event Subscriber Service
  
  This module handles subscribing to Redis Pub/Sub channels and
  dispatching events to appropriate handlers.
  
  Design Pattern: Publish-Subscribe (Pub/Sub)
  
  Benefits of this pattern:
  1. Complete decoupling from the Borrow Service
  2. Borrow Service doesn't know this service exists
  3. We can add more subscribers without changing publishers
  4. If this service is down, the borrow operations still succeed
  
  How it works:
  1. Connect to Redis
  2. Subscribe to the "library-events" channel
  3. When a message arrives, parse it and route to handlers
  4. Each handler processes the event independently
  
  This service demonstrates the "reactive" pattern where services
  react to events rather than being called directly.
*/

import { createClient } from "redis";
import { handleBookIssued, handleBookReturned, handleUserDeleted, handleBookAdded, handleBookUpdated } from "./eventHandlers.js";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Channel names that services publish to
const BOOK_BORROWED_CHANNEL = "BookBorrowed";
const BOOK_RETURNED_CHANNEL = "BookReturned";
const USER_DELETED_CHANNEL = "UserDeleted";
const BOOK_ADDED_CHANNEL = "BookAdded";
const BOOK_UPDATED_CHANNEL = "BookUpdated";

let subscriberClient = null;
let isConnected = false;

/*
  Process BookBorrowed event
*/
const processBookBorrowed = async (message) => {
  try {
    const data = JSON.parse(message);
    console.log(`\n[Event Subscriber] Received BookBorrowed event`);
    console.log(`[Event Subscriber] Data:`, JSON.stringify(data, null, 2));
    
    // Transform to expected format for handler
    const event = {
      type: "BOOK_ISSUED",
      data: {
        borrowId: data.borrowId,
        email: data.email,
        memberEmail: data.email,
        memberName: data.borrowerName,
        borrowerName: data.borrowerName,
        bookId: data.bookId,
        bookTitle: data.bookTitle,
        dueDate: data.dueDate,
        userId: data.userId,
        borrowDate: data.borrowDate
      },
      timestamp: data.timestamp
    };
    
    await handleBookIssued(event);
  } catch (error) {
    console.error("[Event Subscriber] Failed to process BookBorrowed:", error.message);
  }
};

/*
  Process BookReturned event
*/
const processBookReturned = async (message) => {
  try {
    const data = JSON.parse(message);
    console.log(`\n[Event Subscriber] Received BookReturned event`);
    
    // Transform to expected format for handler
    const event = {
      type: "BOOK_RETURNED",
      data: {
        borrowId: data.borrowId,
        email: data.email,
        memberEmail: data.email,
        bookId: data.bookId,
        userId: data.userId,
        returnDate: data.returnDate
      },
      timestamp: data.timestamp
    };
    
    await handleBookReturned(event);
  } catch (error) {
    console.error("[Event Subscriber] Failed to process BookReturned:", error.message);
  }
};

/*
  Process UserDeleted event
*/
const processUserDeleted = async (message) => {
  try {
    const data = JSON.parse(message);
    console.log(`\n[Event Subscriber] Received UserDeleted event`);
    console.log(`[Event Subscriber] Data:`, JSON.stringify(data, null, 2));
    
    // Transform to expected format for handler
    const event = {
      type: "USER_DELETED",
      data: {
        userId: data.userId,
        username: data.username,
        email: data.email,
        deletedBy: data.deletedBy
      },
      timestamp: data.timestamp
    };
    
    await handleUserDeleted(event);
  } catch (error) {
    console.error("[Event Subscriber] Failed to process UserDeleted:", error.message);
  }
};

/*
  Process BookAdded event
*/
const processBookAdded = async (message) => {
  try {
    const parsed = JSON.parse(message);
    const data = parsed.data || parsed;
    console.log(`\n[Event Subscriber] Received BookAdded event`);
    console.log(`[Event Subscriber] Data:`, JSON.stringify(data, null, 2));
    
    const event = {
      type: "BOOK_ADDED",
      data: {
        bookId: data.bookId,
        title: data.title,
        author: data.author,
        category: data.category,
        coverImageUrl: data.coverImageUrl
      },
      timestamp: parsed.timestamp || new Date().toISOString()
    };
    
    await handleBookAdded(event);
  } catch (error) {
    console.error("[Event Subscriber] Failed to process BookAdded:", error.message);
  }
};

/*
  Process BookUpdated event
*/
const processBookUpdated = async (message) => {
  try {
    const parsed = JSON.parse(message);
    const data = parsed.data || parsed;
    console.log(`\n[Event Subscriber] Received BookUpdated event`);
    console.log(`[Event Subscriber] Data:`, JSON.stringify(data, null, 2));
    
    const event = {
      type: "BOOK_UPDATED",
      data: {
        bookId: data.bookId,
        title: data.title,
        author: data.author,
        category: data.category
      },
      timestamp: parsed.timestamp || new Date().toISOString()
    };
    
    await handleBookUpdated(event);
  } catch (error) {
    console.error("[Event Subscriber] Failed to process BookUpdated:", error.message);
  }
};

/*
  Initialize Redis subscription
  Creates a subscriber client and subscribes to the library-events channel.
  
  Important: Redis Pub/Sub requires a dedicated client for subscribing.
  A client in subscribe mode cannot execute other commands.
*/
export const initializeEventSubscriber = async () => {
  try {
    subscriberClient = createClient({
      socket: {
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT)
      }
    });
    
    subscriberClient.on("error", (err) => {
      console.error("[Event Subscriber] Redis error:", err.message);
      isConnected = false;
    });
    
    subscriberClient.on("connect", () => {
      console.log("[Event Subscriber] Connected to Redis");
      isConnected = true;
    });
    
    subscriberClient.on("disconnect", () => {
      console.log("[Event Subscriber] Disconnected from Redis");
      isConnected = false;
    });
    
    await subscriberClient.connect();
    
    /*
      Subscribe to all channels
      Each channel has its own handler
    */
    await subscriberClient.subscribe(BOOK_BORROWED_CHANNEL, processBookBorrowed);
    await subscriberClient.subscribe(BOOK_RETURNED_CHANNEL, processBookReturned);
    await subscriberClient.subscribe(USER_DELETED_CHANNEL, processUserDeleted);
    await subscriberClient.subscribe(BOOK_ADDED_CHANNEL, processBookAdded);
    await subscriberClient.subscribe(BOOK_UPDATED_CHANNEL, processBookUpdated);
    
    console.log(`[Event Subscriber] Subscribed to channels: ${BOOK_BORROWED_CHANNEL}, ${BOOK_RETURNED_CHANNEL}, ${USER_DELETED_CHANNEL}, ${BOOK_ADDED_CHANNEL}, ${BOOK_UPDATED_CHANNEL}`);
    return true;
    
  } catch (error) {
    console.error("[Event Subscriber] Failed to connect to Redis:", error.message);
    console.log("[Event Subscriber] Service will continue without event subscription.");
    return false;
  }
};

/*
  Get subscriber connection status
*/
export const isSubscriberConnected = () => isConnected;

/*
  Graceful shutdown
  Unsubscribes from the channel and closes the Redis connection.
*/
export const closeEventSubscriber = async () => {
  if (subscriberClient) {
    try {
      await subscriberClient.unsubscribe(BOOK_BORROWED_CHANNEL);
      await subscriberClient.unsubscribe(BOOK_RETURNED_CHANNEL);
      await subscriberClient.unsubscribe(USER_DELETED_CHANNEL);
      await subscriberClient.unsubscribe(BOOK_ADDED_CHANNEL);
      await subscriberClient.unsubscribe(BOOK_UPDATED_CHANNEL);
      await subscriberClient.quit();
      console.log("[Event Subscriber] Redis connection closed");
    } catch (error) {
      console.error("[Event Subscriber] Error closing connection:", error.message);
    }
  }
};
