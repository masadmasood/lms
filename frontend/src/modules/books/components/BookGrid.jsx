import { useMemo } from "react";
import { BookCard } from "./BookCard";
import { BookGridSkeleton } from "./BookGridSkeleton";

/**
 * BookGrid Component - Displays grid of books with search filtering
 * @param {Object} props
 * @param {Array} props.books - Array of book objects
 * @param {string} props.searchQuery - Search query for filtering
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onBorrow - Callback when borrow button is clicked
 */
export function BookGrid({ books, searchQuery, isLoading, onBorrow }) {
  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!books || !Array.isArray(books)) {
      return [];
    }
    return books.filter((book) => {
      if (!book) return false;
      const bookTitle = book.title || "";
      const bookAuthor = book.author || "";
      const matchesSearch =
        bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookAuthor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, books]);

  if (isLoading) {
    return <BookGridSkeleton count={8} />;
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">
          No books found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredBooks.map((book) => (
        <BookCard key={book.bookId} book={book} onBorrow={onBorrow} />
      ))}
    </div>
  );
}

export default BookGrid;

