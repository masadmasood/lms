import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { BOOKS_QUERY_KEY } from "@/modules/books/hooks/useBooks";
import { toast } from "sonner";

/**
 * Hook to handle adding a new book
 */
export const useAddBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.addBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
      toast.success("Book added successfully!", {
        description: `"${data.data?.title}" has been added to the catalog.`,
      });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to add book. Please try again.";
      toast.error("Failed to add book", { description: errorMessage });
      options.onError?.(error);
    },
  });
};

/**
 * Hook to handle deleting a book
 */
export const useDeleteBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.deleteBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
      toast.success("Book deleted successfully!", {
        description: `"${data.data?.title}" has been removed from the catalog.`,
      });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete book. Please try again.";
      toast.error("Failed to delete book", { description: errorMessage });
      options.onError?.(error);
    },
  });
};

/**
 * Hook to handle updating a book
 */
export const useUpdateBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, bookData }) => adminService.updateBook(bookId, bookData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
      toast.success("Book updated successfully!");
      options.onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update book. Please try again.";
      toast.error("Failed to update book", { description: errorMessage });
      options.onError?.(error);
    },
  });
};

export default { useAddBook, useDeleteBook, useUpdateBook };
