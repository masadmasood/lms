/*
  Book Subscribe Button Component
  
  Shows subscribe/unsubscribe button for a specific book.
*/

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSubscribeToBook, useUnsubscribeFromBook, useUserSubscriptions } from "../hooks/useSubscriptions";
import { getUser } from "@/shared/utils/auth";

/**
 * Book Subscribe Button
 */
export default function BookSubscribeButton({ bookId, bookTitle, bookCategory, size = "sm", className = "" }) {
  const user = getUser();
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch user subscriptions
  const { data: subscriptionsData } = useUserSubscriptions();
  const subscribedBooks = subscriptionsData?.data?.books || [];

  // Mutations
  const subscribeMutation = useSubscribeToBook();
  const unsubscribeMutation = useUnsubscribeFromBook();

  // Check if subscribed
  useEffect(() => {
    const found = subscribedBooks.find(sub => sub.bookId === bookId);
    setIsSubscribed(!!found);
  }, [subscribedBooks, bookId]);

  // Handle subscribe
  const handleSubscribe = async () => {
    try {
      await subscribeMutation.mutateAsync({
        bookId,
        bookTitle,
        bookCategory
      });
      setIsSubscribed(true);
      toast.success(`Subscribed to "${bookTitle}"!`, {
        description: "You'll receive notifications about this book."
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to subscribe";
      toast.error("Subscribe Failed", { description: errorMsg });
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    try {
      await unsubscribeMutation.mutateAsync(bookId);
      setIsSubscribed(false);
      toast.success(`Unsubscribed from "${bookTitle}"`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to unsubscribe";
      toast.error("Unsubscribe Failed", { description: errorMsg });
    }
  };

  const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending;

  // Don't show for admin
  if (user?.role === "admin") {
    return null;
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "secondary"}
      size={size}
      className={className}
      disabled={isPending}
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="w-4 h-4 mr-2" />
      ) : (
        <Bell className="w-4 h-4 mr-2" />
      )}
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
