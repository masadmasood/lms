/*
  Notifications Panel Component
  
  Dropdown panel showing user's notifications with read/unread status.
*/

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  BookPlus,
  Tag,
  AlertCircle,
  Loader2,
  BellOff,
} from "lucide-react";
import {
  useUserNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/modules/subscriptions/hooks/useNotifications";
import { cn } from "@/lib/utils";

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case "BOOK_ADDED":
      return <BookPlus className="w-4 h-4 text-green-500" />;
    case "BOOK_UPDATED":
      return <BookOpen className="w-4 h-4 text-blue-500" />;
    case "BOOK_AVAILABLE":
      return <BookOpen className="w-4 h-4 text-green-500" />;
    case "BOOK_BORROWED":
      return <BookOpen className="w-4 h-4 text-primary" />;
    case "BOOK_RETURNED":
      return <BookOpen className="w-4 h-4 text-success" />;
    case "CATEGORY_UPDATE":
      return <Tag className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

/**
 * Notifications Panel Component
 */
export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useUserNotifications({ limit: 10 });
  const notifications = notificationsData?.data?.notifications || [];

  // Unread count
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Handle delete
  const handleDelete = async (notificationId) => {
    try {
      await deleteMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Just now";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-white! border-0!" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="w-3 h-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <BellOff className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm line-clamp-2",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.notificationId);
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.notificationId);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

      </PopoverContent>
    </Popover>
  );
}
