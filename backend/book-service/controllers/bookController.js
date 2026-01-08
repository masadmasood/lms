/*
  Book Controller
  
  This controller handles all book-related operations for the Book Service.
  It implements the following responsibilities:
  
  1. List all books - Returns the complete catalog
  2. Get book by ID - Returns a specific book's details
  3. Decrease available copies - Called when a book is issued (by Borrow Service)
  4. Increase available copies - Called when a book is returned (by Borrow Service)
  
  Important: This controller does NOT know about borrowing logic or members.
  It only manages book data and availability counts.
  
  The decrease/increase operations are called by the Borrow Service via REST API.
  This maintains loose coupling - Book Service doesn't know WHY availability changes,
  only that it needs to change.
*/

import Book from "../models/Book.js";
import { publishBookAdded, publishBookDeleted, publishBookUpdated } from "../services/eventPublisher.js";
import { v4 as uuidv4 } from "uuid";

/*
  Get all books
  Returns the complete list of books in the library catalog.
  Supports query parameters for filtering:
  - ?status=available - Filter by status (available/unavailable)
  - ?category=Technology - Filter by category
  - ?author=Robert C. Martin - Filter by author
  - ?search=clean code - Search in title/author/description
  - Multiple filters can be combined: ?status=available&category=Technology
  
  Used by frontend and Borrow Service to display books.
*/
export const getAllBooks = async (req, res) => {
  try {
    const { status, category, author, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by status
    if (status) {
      if (status === 'available' || status === 'unavailable') {
        filter.status = status;
      }
    }
    
    // Filter by category
    if (category) {
      filter.category = { $regex: category, $options: 'i' }; // Case-insensitive
    }
    
    // Filter by author
    if (author) {
      filter.author = { $regex: author, $options: 'i' }; // Case-insensitive
    }
    
    // Search in title, author, or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const books = await Book.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: books.length,
      filters: {
        status: status || null,
        category: category || null,
        author: author || null,
        search: search || null
      },
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get book by ID
  Returns a specific book by its unique identifier.
  Returns 404 if book is not found.
*/
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ bookId: id });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Decrease available copies
  Called by Borrow Service when a book is successfully issued.
  
  This endpoint:
  1. Validates the book exists
  2. Checks if copies are available
  3. Decrements the availableCopies count
  
  Returns 400 if no copies are available (prevents over-borrowing).
  This is a business rule enforcement at the data-owning service level.
*/
export const decreaseAvailableCopies = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ bookId: id });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found"
      });
    }
    
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        error: "No copies available for borrowing"
      });
    }
    
    book.availableCopies -= 1;
    if (book.availableCopies === 0) {
      book.status = 'unavailable';
    }
    await book.save();
    
    res.status(200).json({
      success: true,
      message: "Book availability decreased",
      data: {
        bookId: book.bookId,
        title: book.title,
        availableCopies: book.availableCopies,
        totalCopies: book.totalCopies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Increase available copies
  Called by Borrow Service when a book is successfully returned.
  
  This endpoint:
  1. Validates the book exists
  2. Checks that we don't exceed total copies (data integrity)
  3. Increments the availableCopies count
  
  Returns 400 if increasing would exceed total copies (shouldn't happen in normal flow).
*/
export const increaseAvailableCopies = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ bookId: id });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found"
      });
    }
    
    if (book.availableCopies >= book.totalCopies) {
      return res.status(400).json({
        success: false,
        error: "Cannot increase copies beyond total inventory"
      });
    }
    
    book.availableCopies += 1;
    if (book.availableCopies > 0) {
      book.status = 'available';
    }
    await book.save();
    
    res.status(200).json({
      success: true,
      message: "Book availability increased",
      data: {
        bookId: book.bookId,
        title: book.title,
        availableCopies: book.availableCopies,
        totalCopies: book.totalCopies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Add a new book (Admin Only)
  Creates a new book in the catalog and publishes BookAdded event.
*/
export const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      language,
      pages,
      description,
      coverImageUrl,
      totalCopies
    } = req.body;

    // Validate required fields
    if (!title || !author || !category || !pages || !coverImageUrl || !totalCopies) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, author, category, pages, coverImageUrl, totalCopies"
      });
    }

    // Generate unique bookId
    const bookId = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newBook = new Book({
      bookId,
      title,
      author,
      category,
      language: language || ["English"],
      pages,
      description: description || "",
      coverImageUrl,
      totalCopies,
      availableCopies: totalCopies,
      status: "available"
    });

    await newBook.save();

    // Publish BookAdded event for real-time notifications
    await publishBookAdded({
      bookId: newBook.bookId,
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      coverImageUrl: newBook.coverImageUrl
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Delete a book (Admin Only)
  Removes a book from the catalog and publishes BookDeleted event.
*/
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ bookId: id });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found"
      });
    }

    // Check if any copies are borrowed
    if (book.availableCopies < book.totalCopies) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete book. Some copies are still borrowed."
      });
    }

    await Book.deleteOne({ bookId: id });

    // Publish BookDeleted event
    await publishBookDeleted({
      bookId: book.bookId,
      title: book.title
    });

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: { bookId: id, title: book.title }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Update a book (Admin Only)
  Updates book details and publishes BookUpdated event.
*/
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findOne({ bookId: id });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found"
      });
    }

    // Update allowed fields
    const allowedUpdates = ["title", "author", "category", "language", "pages", "description", "coverImageUrl", "totalCopies"];
    
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        book[field] = updates[field];
      }
    });

    // If totalCopies increased, increase availableCopies too
    if (updates.totalCopies && updates.totalCopies > book.totalCopies) {
      const diff = updates.totalCopies - book.totalCopies;
      book.availableCopies += diff;
    }

    // Update status based on availability
    book.status = book.availableCopies > 0 ? "available" : "unavailable";

    await book.save();

    // Publish BookUpdated event
    await publishBookUpdated({
      bookId: book.bookId,
      title: book.title,
      author: book.author
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
