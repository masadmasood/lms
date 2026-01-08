import { useState, useMemo } from "react";
import { ReturnBooksHeader } from "./components/ReturnBooksHeader";
import { ReturnBooksTable } from "./components/ReturnBooksTable";
import { ReturnBooksStats } from "./components/ReturnBooksStats";
import { useActiveBorrowedBooks } from "./hooks/useActiveBorrowedBooks";

/**
 * ReturnBooks - Main composition component for the return module
 * Displays user's active borrowed books with return functionality
 */
export default function ReturnBooks() {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only active borrowed books using React Query
  const { data: activeBooks = [], isLoading, isError, error } = useActiveBorrowedBooks();

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!activeBooks || !Array.isArray(activeBooks)) {
      return [];
    }
    return activeBooks.filter((book) => {
      if (!book) return false;
      const bookTitle = book.bookTitle || "";
      const bookAuthor = book.bookAuthor || book.author || "";
      const category = book.category || "";
      const matchesSearch =
        bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, activeBooks]);

  return (
    <div className="flex flex-col w-full">
      {/* Header with search */}
      <ReturnBooksHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heading mb-1">Return Books</h1>
          <p className="text-sm text-muted-foreground">
            Select and return borrowed books to the library
          </p>
        </div>

        {/* Books Table */}
        <ReturnBooksTable
          books={filteredBooks}
          searchQuery={searchQuery}
          isLoading={isLoading}
        />

        {/* Stats Summary */}
        {filteredBooks.length > 0 && (
          <ReturnBooksStats books={filteredBooks} />
        )}
      </main>
    </div>
  );
}

// Re-export components for external use
export { ReturnBooksHeader } from "./components/ReturnBooksHeader";
export { ReturnBooksTable } from "./components/ReturnBooksTable";
export { ReturnBooksStats } from "./components/ReturnBooksStats";
export { useActiveBorrowedBooks } from "./hooks/useActiveBorrowedBooks";

