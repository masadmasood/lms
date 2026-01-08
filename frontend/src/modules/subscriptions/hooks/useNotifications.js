/*
  useNotifications Hook
  
  React Query hooks for managing user notifications from database.
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificationService from "../services/notificationService";
import { getUser } from "@/shared/utils/auth";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];

/**
 * Hook to get user notifications
 */
export const useUserNotifications = (options = {}) => {
  const user = getUser();
  const userId = user?._id;
  const { page = 1, limit = 20, unreadOnly = false } = options;

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, { page, limit, unreadOnly }],
    queryFn: () => notificationService.getUserNotifications(userId, { page, limit, unreadOnly }),
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get unread notification count
 */
export const useUnreadNotificationCount = () => {
  const user = getUser();
  const userId = user?._id;

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, "unread-count"],
    queryFn: () => notificationService.getUnreadCount(userId),
    enabled: !!userId,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (notificationId) => 
      notificationService.markAsRead(notificationId, user?._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(user?._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: (notificationId) => 
      notificationService.deleteNotification(notificationId, user?._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    }
  });
};

/**
 * Hook to delete all notifications
 */
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(user?._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    }
  });
};

export default useUserNotifications;
