/*
  Borrow Controller - Simple & Clean
  
  Handles:
  1. Borrow Book - Email verify -> Create record -> Publish event
  2. Return Book - Update record -> Publish event
*/

import Borrow from "../models/Borrow.js";
import { verifyEmail } from "../services/authServiceClient.js";
import { publishBookBorrowed, publishBookReturned } from "../services/eventPublisher.js";
import { getBook } from "../services/bookServiceClient.js";

/*
  Borrow a Book
  
  Flow:
  1. Validate input (userId, bookId, email)
  2. Verify email exists in Auth Service
  3. Check if user already has this book borrowed
  4. Create borrow record (status = BORROWED)
  5. Publish BookBorrowed event to Redis
*/
export const borrowBook = async (req, res) => {
  try {
    const { userId, bookId, email, borrowerName, borrowDuration } = req.body;

    // Step 1: Validate input
    if (!userId || !bookId || !email) {
      return res.status(400).json({
        success: false,
        message: "userId, bookId, and email are required"
      });
    }

    // Step 2: Verify email exists in Auth Service
    try {
      await verifyEmail(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Email verification failed"
      });
    }

    // Step 3: Check if user already has this book borrowed
    const existingBorrow = await Borrow.findOne({
      userId,
      bookId,
      status: "BORROWED"
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: "You already have this book borrowed"
      });
    }

    // Calculate due date based on borrowDuration (default 14 days, max 14 days)
    const duration = Math.min(parseInt(borrowDuration) || 14, 14);
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + duration);

    // Step 4: Create borrow record with dueDate
    const borrow = new Borrow({
      userId,
      bookId,
      email: email.toLowerCase(),
      borrowerName: borrowerName || email.split('@')[0], // Use username or fallback to email prefix
      borrowDate,
      dueDate,
      status: "BORROWED"
    });

    await borrow.save();

    // Get book details for email
    let bookTitle = "Unknown Book";
    try {
      const bookData = await getBook(bookId);
      if (bookData && bookData.data) {
        bookTitle = bookData.data.title || "Unknown Book";
      }
    } catch (err) {
      console.log("[Borrow] Could not fetch book title for email:", err.message);
    }

    // Step 5: Publish BookBorrowed event to Redis
    await publishBookBorrowed({
      borrowId: borrow._id,
      userId,
      bookId,
      email: email.toLowerCase(),
      borrowerName: borrow.borrowerName,
      bookTitle,
      dueDate: dueDate.toISOString(),
      borrowDate: borrow.borrowDate
    });

    return res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: borrow
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during borrow",
      error: error.message
    });
  }
};

/*
  Return a Book
  
  Flow:
  1. Find borrow record by borrowId
  2. Check if already returned
  3. Update record (status = RETURNED, returnDate = now)
  4. Publish BookReturned event to Redis
*/
export const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;

    // Step 1: Find borrow record
    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found"
      });
    }

    // Step 2: Check if already returned
    if (borrow.status === "RETURNED") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned"
      });
    }

    // Step 3: Update borrow record
    borrow.status = "RETURNED";
    borrow.returnDate = new Date();

    await borrow.save();

    // Step 4: Publish BookReturned event to Redis
    await publishBookReturned({
      borrowId: borrow._id,
      userId: borrow.userId,
      bookId: borrow.bookId,
      email: borrow.email,
      returnDate: borrow.returnDate
    });

    return res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: borrow
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during return",
      error: error.message
    });
  }
};

/*
  Get all borrow records (with optional filters)
  Enriches response with book details (title, author) from Book Service
*/
export const getAllBorrows = async (req, res) => {
  try {
    const { status, email, userId } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (email) filter.email = email.toLowerCase();
    if (userId) filter.userId = userId;

    const borrows = await Borrow.find(filter).sort({ createdAt: -1 });

    // Enrich borrow records with book details
    const enrichedBorrows = await Promise.all(
      borrows.map(async (borrow) => {
        const borrowObj = borrow.toObject();
        borrowObj.id = borrowObj._id; // Add id field for frontend
        
        // Add borrower name from email (username part before @)
        borrowObj.borrowerName = borrowObj.email ? borrowObj.email.split('@')[0] : "Unknown";
        
        try {
          const bookData = await getBook(borrowObj.bookId);
          if (bookData && bookData.data) {
            const book = bookData.data;
            borrowObj.bookTitle = book.title || "Unknown";
            borrowObj.bookAuthor = book.author || "Unknown";
            borrowObj.coverImageUrl = book.coverImageUrl || null;
            // Use stored dueDate, fallback to 14 days for old records without dueDate
            if (!borrowObj.dueDate) {
              const dueDate = new Date(borrowObj.borrowDate);
              dueDate.setDate(dueDate.getDate() + 14);
              borrowObj.dueDate = dueDate;
            }
          } else {
            borrowObj.bookTitle = "Book not found";
            borrowObj.bookAuthor = "N/A";
          }
        } catch (error) {
          borrowObj.bookTitle = "Service unavailable";
          borrowObj.bookAuthor = "N/A";
        }
        
        return borrowObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedBorrows.length,
      data: enrichedBorrows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/*
  Get borrow record by ID
*/
export const getBorrowById = async (req, res) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: borrow
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/*
  Get user borrow history by email
  Enriches response with book details (title, author) from Book Service
*/
export const getUserBorrowHistory = async (req, res) => {
  try {
    const { email } = req.params;

    const borrows = await Borrow.find({ 
      email: email.toLowerCase() 
    }).sort({ createdAt: -1 });

    // Enrich borrow records with book details
    const enrichedBorrows = await Promise.all(
      borrows.map(async (borrow) => {
        const borrowObj = borrow.toObject();
        borrowObj.id = borrowObj._id; // Add id field for frontend
        
        // Use stored borrowerName or fallback to email prefix
        if (!borrowObj.borrowerName) {
          borrowObj.borrowerName = borrowObj.email ? borrowObj.email.split('@')[0] : "Unknown";
        }
        
        try {
          const bookData = await getBook(borrowObj.bookId);
          if (bookData && bookData.data) {
            const book = bookData.data;
            borrowObj.bookTitle = book.title || "Unknown";
            borrowObj.bookAuthor = book.author || "Unknown";
            borrowObj.coverImageUrl = book.coverImageUrl || null;
            // Use stored dueDate, fallback to 14 days for old records without dueDate
            if (!borrowObj.dueDate) {
              const dueDate = new Date(borrowObj.borrowDate);
              dueDate.setDate(dueDate.getDate() + 14);
              borrowObj.dueDate = dueDate;
            }
          } else {
            borrowObj.bookTitle = "Book not found";
            borrowObj.bookAuthor = "N/A";
          }
        } catch (error) {
          borrowObj.bookTitle = "Service unavailable";
          borrowObj.bookAuthor = "N/A";
        }
        
        return borrowObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedBorrows.length,
      data: enrichedBorrows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
