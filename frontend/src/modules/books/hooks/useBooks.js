import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { bookService } from "../services/bookService";

/**
 * Query key for books
 */
export const BOOKS_QUERY_KEY = ["books"];

/**
 * Hook to fetch all books using React Query
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status ('available' | 'unavailable')
 * @param {string} filters.category - Filter by category
 * @param {string} filters.author - Filter by author
 * @param {string} filters.search - Search in title/author/description
 * @returns {Object} Query result with books data, loading, and error states
 */
export const useBooks = (filters = {}) => {
  // Memoize query key to prevent infinite loops when filters object reference changes
  const queryKey = useMemo(() => {
    // Only include filters in query key if they have actual values
    const hasFilters = filters && Object.keys(filters).length > 0;
    if (hasFilters) {
      // Create a stable object with only defined filter values
      const filterKey = {
        status: filters.status,
        category: filters.category,
        author: filters.author,
        search: filters.search,
      };
      // Remove undefined values
      Object.keys(filterKey).forEach(key => filterKey[key] === undefined && delete filterKey[key]);
      return Object.keys(filterKey).length > 0 
        ? [...BOOKS_QUERY_KEY, filterKey] 
        : BOOKS_QUERY_KEY;
    }
    return BOOKS_QUERY_KEY;
  }, [
    filters?.status,
    filters?.category,
    filters?.author,
    filters?.search,
  ]);
  
  return useQuery({
    queryKey,
    queryFn: () => bookService.getBooks(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export default useBooks;

