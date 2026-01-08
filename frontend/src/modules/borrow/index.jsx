import { useState, useMemo, useEffect } from "react";
import { BorrowedBooksHeader } from "./components/BorrowedBooksHeader";
import { BorrowedBooksTable } from "./components/BorrowedBooksTable";
import { BorrowedBooksStats } from "./components/BorrowedBooksStats";
import { useBorrowedBooks } from "./hooks/useBorrowedBooks";

/**
 * MyBorrowedBooks - Main composition component for the borrow module
 * Displays user's borrowed books with search and return functionality
 */
export default function MyBorrowedBooks() {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch borrowed books using React Query
  const { data: borrowedBooks = [], isLoading, isError, error, refetch } = useBorrowedBooks();

  // Refetch data when component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!borrowedBooks || !Array.isArray(borrowedBooks)) {
      return [];
    }
    return borrowedBooks.filter((book) => {
      if (!book) return false;
      const bookTitle = book.bookTitle || "";
      const bookAuthor = book.bookAuthor || book.author || "";
      const borrowerName = book.memberName || book.borrowerName || "";
      const matchesSearch =
        bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        borrowerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, borrowedBooks]);

  return (
    <div className="flex flex-col w-full">
      {/* Header with search */}
      <BorrowedBooksHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 pt-0">
        {/* Books Table */}
        <BorrowedBooksTable
          books={filteredBooks}
          searchQuery={searchQuery}
          isLoading={isLoading}
        />

        {/* Stats Summary */}
        {filteredBooks.length > 0 && (
          <BorrowedBooksStats books={filteredBooks} />
        )}
      </main>
    </div>
  );
}

// Re-export components for external use
export { BorrowedBooksHeader } from "./components/BorrowedBooksHeader";
export { BorrowedBooksTable } from "./components/BorrowedBooksTable";
export { BorrowedBooksStats } from "./components/BorrowedBooksStats";
export { useBorrowedBooks } from "./hooks/useBorrowedBooks";
export { useBorrowBook } from "./hooks/useBorrowBook";
export { useReturnBook } from "./hooks/useReturnBook";
export { borrowService } from "./services/borrowService";

