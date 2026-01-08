import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { BOOKS_URL } from "@/config/api";
import { useQueryClient } from "@tanstack/react-query";
import { BOOKS_QUERY_KEY } from "@/modules/books/hooks/useBooks";
import { useUserSubscriptions } from "@/modules/subscriptions/hooks/useSubscriptions";

/**
 * Hook to subscribe to real-time book notifications via SSE
 * Shows toast notifications when books are added/updated/deleted
 * Only shows toast if user has subscribed to the book's category
 */
export const useBookNotifications = () => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef(null);
  
  // Get user subscriptions to check if user subscribed to category
  const { data: subscriptionsData } = useUserSubscriptions();
  const subscribedCategories = subscriptionsData?.data?.categories || [];
  
  // Create a set of subscribed category names for quick lookup
  const subscribedCategoryNames = useRef(new Set());
  
  useEffect(() => {
    subscribedCategoryNames.current = new Set(
      subscribedCategories.map(sub => sub.categoryName || sub.categoryId)
    );
  }, [subscribedCategories]);

  const connect = useCallback(() => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection
    const eventSource = new EventSource(`${BOOKS_URL}/api/notifications/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[Notifications] Connected to notification stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        
        // Handle different notification types
        switch (notification.type) {
          case "connected":
            console.log("[Notifications] Stream connected");
            break;
            
          case "BookAdded":
            // Only show toast if user has subscribed to this category
            const bookCategory = notification.data.category;
            const isSubscribed = subscribedCategoryNames.current.has(bookCategory);
            
            if (isSubscribed) {
              toast.success("📚 New Book Added!", {
                description: `"${notification.data.title}" by ${notification.data.author} is now available in ${bookCategory}.`,
                duration: 5000,
              });
            }
            // Always invalidate books query to refetch (so books list updates)
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
            break;
            
          case "BookDeleted":
            toast.info("🗑️ Book Removed", {
              description: `"${notification.data.title}" has been removed from the catalog.`,
              duration: 5000,
            });
            // Invalidate books query to refetch
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
            break;
            
          case "BookUpdated":
            toast.info("📝 Book Updated", {
              description: `"${notification.data.title}" has been updated.`,
              duration: 4000,
            });
            // Invalidate books query to refetch
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
            break;
            
          default:
            console.log("[Notifications] Unknown notification type:", notification.type);
        }
      } catch (error) {
        console.error("[Notifications] Error parsing notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[Notifications] SSE error:", error);
      eventSource.close();
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log("[Notifications] Attempting to reconnect...");
        connect();
      }, 5000);
    };

    return eventSource;
  }, [queryClient]);

  useEffect(() => {
    const eventSource = connect();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("[Notifications] Disconnected from notification stream");
      }
    };
  }, [connect]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
};

export default useBookNotifications;
