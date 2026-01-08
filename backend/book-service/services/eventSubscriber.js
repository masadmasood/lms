import { createClient } from "redis";
import Book from "../models/Book.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Redis subscriber for Book Service
// Listens to events from Borrow Service via Redis Pub/Sub

let subscriber = null;

// Initialize Redis subscriber
export const initSubscriber = async () => {
  try {
    subscriber = createClient({ url: REDIS_URL });

    subscriber.on("error", (err) => {
      console.error("[Book Service] Redis Subscriber Error:", err);
    });

    await subscriber.connect();
    console.log("[Book Service] Redis Subscriber connected");

    // Subscribe to book events
    await subscriber.subscribe("BookBorrowed", handleBookBorrowed);
    await subscriber.subscribe("BookReturned", handleBookReturned);

    console.log("[Book Service] Subscribed to: BookBorrowed, BookReturned");
  } catch (error) {
    console.error("[Book Service] Failed to connect Redis Subscriber:", error.message);
  }
};

// Handle BookBorrowed event - Decrease available copies
const handleBookBorrowed = async (message) => {
  try {
    const data = JSON.parse(message);
    const { bookId } = data;

    console.log(`[Book Service] Received BookBorrowed event for bookId: ${bookId}`);

    const book = await Book.findOne({ bookId });

    if (!book) {
      console.error(`[Book Service] Book not found: ${bookId}`);
      return;
    }

    if (book.availableCopies <= 0) {
      console.error(`[Book Service] No copies available for: ${bookId}`);
      return;
    }

    // Decrease available copies
    book.availableCopies -= 1;

    // Update status if no copies left
    if (book.availableCopies === 0) {
      book.status = "unavailable";
    }

    await book.save();

    console.log(`[Book Service] Book ${bookId} availability updated: ${book.availableCopies}/${book.totalCopies}`);
  } catch (error) {
    console.error("[Book Service] Error handling BookBorrowed:", error.message);
  }
};

// Handle BookReturned event - Increase available copies
const handleBookReturned = async (message) => {
  try {
    const data = JSON.parse(message);
    const { bookId } = data;

    console.log(`[Book Service] Received BookReturned event for bookId: ${bookId}`);

    const book = await Book.findOne({ bookId });

    if (!book) {
      console.error(`[Book Service] Book not found: ${bookId}`);
      return;
    }

    // Increase available copies (max = totalCopies)
    if (book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
    }

    // Update status if copies available
    if (book.availableCopies > 0) {
      book.status = "available";
    }

    await book.save();

    console.log(`[Book Service] Book ${bookId} availability updated: ${book.availableCopies}/${book.totalCopies}`);
  } catch (error) {
    console.error("[Book Service] Error handling BookReturned:", error.message);
  }
};

export default { initSubscriber };
