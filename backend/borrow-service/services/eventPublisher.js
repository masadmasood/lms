/*
  Event Publisher Service
  
  Publishes events to Redis Pub/Sub:
  - BookBorrowed: When a book is borrowed
  - BookReturned: When a book is returned
*/

import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;
let isConnected = false;

/*
  Initialize Redis connection
*/
export const initializeEventPublisher = async () => {
  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on("error", (err) => {
      console.error("[Borrow Service] Redis Publisher Error:", err.message);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("[Borrow Service] Redis Publisher connected");
      isConnected = true;
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.warn("[Borrow Service] Failed to connect Redis Publisher:", error.message);
    console.log("[Borrow Service] Service will continue without event publishing.");
    redisClient = null;
    isConnected = false;
    return false;
  }
};

/*
  Publish BookBorrowed event
  Called when a book is successfully borrowed.
*/
export const publishBookBorrowed = async (data) => {
  if (!isConnected || !redisClient) {
    console.log("[Borrow Service] Redis not connected. BookBorrowed event not published.");
    return false;
  }

  try {
    const event = JSON.stringify({
      bookId: data.bookId,
      userId: data.userId,
      email: data.email,
      borrowerName: data.borrowerName,
      bookTitle: data.bookTitle,
      dueDate: data.dueDate,
      borrowId: data.borrowId,
      borrowDate: data.borrowDate,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish("BookBorrowed", event);
    console.log(`[Borrow Service] Published BookBorrowed event for bookId: ${data.bookId}, email: ${data.email}`);
    return true;
  } catch (error) {
    console.error("[Borrow Service] Failed to publish BookBorrowed:", error.message);
    return false;
  }
};

/*
  Publish BookReturned event
  Called when a book is successfully returned.
*/
export const publishBookReturned = async (data) => {
  if (!isConnected || !redisClient) {
    console.log("[Borrow Service] Redis not connected. BookReturned event not published.");
    return false;
  }

  try {
    const event = JSON.stringify({
      bookId: data.bookId,
      userId: data.userId,
      email: data.email,
      borrowId: data.borrowId,
      returnDate: data.returnDate,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish("BookReturned", event);
    console.log(`[Borrow Service] Published BookReturned event for bookId: ${data.bookId}`);
    return true;
  } catch (error) {
    console.error("[Borrow Service] Failed to publish BookReturned:", error.message);
    return false;
  }
};

/*
  Close Redis connection
*/
export const closeEventPublisher = async () => {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit();
      console.log("[Borrow Service] Redis Publisher connection closed");
    } catch (error) {
      console.error("[Borrow Service] Error closing Redis:", error.message);
    }
  }
};
