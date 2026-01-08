import { useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowService } from "../services/borrowService";
import { BOOKS_QUERY_KEY } from "@/modules/books/hooks/useBooks";
import { BORROWED_BOOKS_QUERY_KEY } from "./useBorrowedBooks";
import { toast } from "sonner";

/**
 * Hook to handle book return mutation using React Query
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Callback on successful return
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Mutation result with mutate function and states
 */
export const useReturnBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: borrowService.returnBook,
    onSuccess: async (data, variables) => {
      // Refetch both queries immediately to ensure instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: BOOKS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: BORROWED_BOOKS_QUERY_KEY }),
      ]);
      toast.success("Book returned successfully!");
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to return book. Please try again.";
      toast.error(errorMessage);
      options.onError?.(error);
    },
  });
};

export default useReturnBook;

