import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookService } from "../services/bookService";
import { BOOKS_QUERY_KEY } from "./useBooks";
import { BORROWED_BOOKS_QUERY_KEY } from "@/modules/borrow/hooks/useBorrowedBooks";
import { toast } from "sonner";

/**
 * Hook to handle book borrowing mutation using React Query
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Callback on successful borrow
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Mutation result with mutate function and states
 */
export const useBorrowBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookService.borrowBook,
    onSuccess: async (data, variables) => {
      // Refetch all related queries immediately for instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: BOOKS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: BORROWED_BOOKS_QUERY_KEY }),
        // Also refetch any specific filtered queries
        queryClient.refetchQueries({ queryKey: ["books"] }),
        queryClient.refetchQueries({ queryKey: ["borrowed-books"] }),
      ]);
      toast.success("Book borrowed successfully!");
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to borrow book. Please try again.";
      toast.error(errorMessage);
      options.onError?.(error);
    },
  });
};

export default useBorrowBook;

