/*
  useSubscriptions Hook
  
  React Query hooks for managing user subscriptions.
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionService from "../services/subscriptionService";
import { getUser } from "@/shared/utils/auth";

export const SUBSCRIPTIONS_QUERY_KEY = ["subscriptions"];

/**
 * Hook to get user subscriptions
 */
export const useUserSubscriptions = (userId = null) => {
  const user = getUser();
  const id = userId || user?._id;

  return useQuery({
    queryKey: [...SUBSCRIPTIONS_QUERY_KEY, id],
    queryFn: () => subscriptionService.getUserSubscriptions(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to subscribe to a category
 */
export const useSubscribeToCategory = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (categoryData) => 
      subscriptionService.subscribeToCategory({
        userId: user?._id,
        userEmail: user?.email,
        userName: user?.username || user?.name,
        ...categoryData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to unsubscribe from a category
 */
export const useUnsubscribeFromCategory = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (categoryId) => 
      subscriptionService.unsubscribeFromCategory({
        userId: user?._id,
        categoryId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to subscribe to a book
 */
export const useSubscribeToBook = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (bookData) => 
      subscriptionService.subscribeToBook({
        userId: user?._id,
        userEmail: user?.email,
        userName: user?.username || user?.name,
        ...bookData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to unsubscribe from a book
 */
export const useUnsubscribeFromBook = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (bookId) => 
      subscriptionService.unsubscribeFromBook({
        userId: user?._id,
        bookId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    }
  });
};

export default useUserSubscriptions;
