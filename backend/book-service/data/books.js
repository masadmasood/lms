/*
  Book Service - In-Memory Data Store
  
  This file contains the book data owned exclusively by the Book Service.
  No other service should have direct access to this data.
  
  Each book has:
  - id: Unique identifier
  - title: Book title
  - author: Book author
  - isbn: International Standard Book Number
  - totalCopies: Total number of copies owned by the library
  - availableCopies: Current number of copies available for borrowing
  
  The availableCopies field is the source of truth for book availability.
  Only this service can modify this value through its exposed APIs.
*/

const books = [
  {
    id: "book-001",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    totalCopies: 5,
    availableCopies: 5
  },
  {
    id: "book-002",
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    isbn: "978-0135957059",
    totalCopies: 3,
    availableCopies: 3
  },
  {
    id: "book-003",
    title: "Design Patterns",
    author: "Gang of Four",
    isbn: "978-0201633610",
    totalCopies: 4,
    availableCopies: 4
  },
  {
    id: "book-004",
    title: "Refactoring",
    author: "Martin Fowler",
    isbn: "978-0134757599",
    totalCopies: 2,
    availableCopies: 2
  },
  {
    id: "book-005",
    title: "Domain-Driven Design",
    author: "Eric Evans",
    isbn: "978-0321125217",
    totalCopies: 3,
    availableCopies: 3
  }
];

export default books;
