import { useBorrowedBooks } from "@/modules/borrow/hooks/useBorrowedBooks";

/**
 * Hook to fetch only active borrowed books (books that can be returned)
 * This is a convenience hook that filters for BORROWED status
 * @returns {Object} Query result with active borrowed books data, loading, and error states
 */
export const useActiveBorrowedBooks = () => {
  return useBorrowedBooks({ status: "BORROWED" });
};

export default useActiveBorrowedBooks;

