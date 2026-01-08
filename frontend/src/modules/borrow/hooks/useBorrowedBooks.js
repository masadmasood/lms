import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { borrowService } from "../services/borrowService";
import { authService } from "@/modules/login/services/authService";

/**
 * Query key for borrowed books
 */
export const BORROWED_BOOKS_QUERY_KEY = ["borrowed-books"];

/**
 * Hook to fetch user's borrowed books using React Query
 * Automatically fetches data instantly on mount and keeps it fresh
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status ('BORROWED' | 'RETURNED')
 * @returns {Object} Query result with borrowed books data, loading, and error states
 */
export const useBorrowedBooks = (filters = {}) => {
  // Get current user email from localStorage (synchronous, instant)
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.email;

  // Memoize query key to prevent infinite loops when filters object reference changes
  const queryKey = useMemo(() => {
    return [...BORROWED_BOOKS_QUERY_KEY, userEmail, filters?.status].filter(Boolean);
  }, [userEmail, filters?.status]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      // If user is logged in, fetch their borrow records
      if (userEmail) {
        return await borrowService.getBorrowRecords({ ...filters, email: userEmail });
      }
      // Otherwise return empty array
      return [];
    },
    enabled: !!userEmail, // Only fetch if user is logged in
    // Always refetch on mount to ensure fresh data
    staleTime: 0, // Data is immediately stale, so it always refetches
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Always refetch on mount, even if data is fresh
    refetchOnMount: 'always',
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
    // Auto refetch every 30 seconds to keep data fresh
    refetchInterval: 30 * 1000,
  });
};

export default useBorrowedBooks;

