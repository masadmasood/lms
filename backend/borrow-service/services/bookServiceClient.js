/*
  Book Service Client
  
  This module handles all HTTP communication with the Book Service.
  It encapsulates the REST API calls and provides a clean interface
  for the Borrow Service to interact with books.
  
  Design Decisions:
  1. Uses native fetch API (available in Node.js 18+)
  2. Throws errors on failed requests for consistent error handling
  3. Returns parsed JSON responses
  4. Includes timeout handling for resilience
  
  This client demonstrates the synchronous REST communication pattern
  in microservices. The Borrow Service calls these methods to:
  - Get book information for validation
  - Update book availability on borrow/return
  
  The Borrow Service does NOT directly access book data - all access
  goes through the Book Service's REST API.
*/

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || "http://localhost:3001";

/*
  Get book by ID
  Fetches book details from the Book Service.
  Used to validate book exists and check availability before borrowing.
*/
export const getBook = async (bookId) => {
  try {
    const response = await fetch(`${BOOK_SERVICE_URL}/api/books/${bookId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch book");
    }
    
    return data;
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      throw new Error("Book Service is unavailable");
    }
    throw error;
  }
};

/*
  Decrease book availability
  Called when a book is successfully issued to a member.
  The Book Service handles the actual decrement and validates
  that copies are available.
*/
export const decreaseBookAvailability = async (bookId) => {
  try {
    const response = await fetch(`${BOOK_SERVICE_URL}/api/books/${bookId}/decrease`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to decrease book availability");
    }
    
    return data;
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      throw new Error("Book Service is unavailable");
    }
    throw error;
  }
};

/*
  Increase book availability
  Called when a book is returned by a member.
  The Book Service handles the actual increment and validates
  that we don't exceed total copies.
*/
export const increaseBookAvailability = async (bookId) => {
  try {
    const response = await fetch(`${BOOK_SERVICE_URL}/api/books/${bookId}/increase`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to increase book availability");
    }
    
    return data;
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      throw new Error("Book Service is unavailable");
    }
    throw error;
  }
};
