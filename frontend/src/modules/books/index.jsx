import { useState } from "react";
import { BooksHeader } from "./components/BooksHeader";
import { BookGrid } from "./components/BookGrid";
import { BorrowDialog } from "./components/BorrowDialog";
import { useBooks } from "./hooks/useBooks";
import { toast } from "sonner";

/**
 * ViewBooks - Main composition component for the books module
 * Combines header, grid, and dialog components with data fetching
 */
export default function ViewBooks() {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch books using React Query
  const { data: books, isLoading, isError, error } = useBooks();

  // Show error toast if fetch fails
  if (isError) {
    toast.error(error?.message || "Failed to load books from server");
  }

  // Handle borrow button click
  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header with search */}
      <BooksHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 pt-0">
        {/* Books Grid */}
        <BookGrid
          books={books || []}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onBorrow={handleBorrowClick}
        />

        {/* Borrow Dialog */}
        <BorrowDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          book={selectedBook}
        />
      </main>
    </div>
  );
}

// Re-export components for external use
export { BooksHeader } from "./components/BooksHeader";
export { BookGrid } from "./components/BookGrid";
export { BookCard } from "./components/BookCard";
export { BorrowDialog } from "./components/BorrowDialog";
export { useBooks } from "./hooks/useBooks";
export { useBorrowBook } from "./hooks/useBorrowBook";
export { bookService } from "./services/bookService";
