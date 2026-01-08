/*
  Categories Subscription Page
  
  Shows all available categories with subscribe/unsubscribe buttons.
  Users can subscribe to categories to receive notifications when new books are added.
*/

import { useState, useMemo } from "react";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  Search,
  Bell,
  BellOff,
  BookOpen,
  Loader2,
  CheckCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { 
  useUserSubscriptions, 
  useSubscribeToCategory, 
  useUnsubscribeFromCategory 
} from "./hooks/useSubscriptions";
import { getUser } from "@/shared/utils/auth";
import NotificationsPanel from "./components/NotificationsPanel";
import { bookCategories } from "@/modules/admin/schemas/addBookSchema";

// Hardcoded categories with icons and colors
const categoryIcons = {
  "Technology": "💻",
  "Science": "🔬",
  "Mathematics": "📐",
  "Literature": "📖",
  "History": "📜",
  "Business": "💼",
  "Self-Help": "💪",
  "Fiction": "📚",
  "Non-Fiction": "📘",
  "Education": "🎓",
  "Art": "🎨",
  "Music": "🎵",
  "Philosophy": "🤔",
  "Psychology": "🧠",
  "Health": "🏥",
  "Other": "📑",
};

const categoryColors = {
  "Technology": "#3b82f6",
  "Science": "#10b981",
  "Mathematics": "#f59e0b",
  "Literature": "#8b5cf6",
  "History": "#ef4444",
  "Business": "#06b6d4",
  "Self-Help": "#ec4899",
  "Fiction": "#6366f1",
  "Non-Fiction": "#14b8a6",
  "Education": "#f97316",
  "Art": "#a855f7",
  "Music": "#eab308",
  "Philosophy": "#64748b",
  "Psychology": "#f43f5e",
  "Health": "#22c55e",
  "Other": "#6b7280",
};

// Convert hardcoded categories to card format
const getHardcodedCategories = () => {
  return bookCategories.map((categoryName) => ({
    categoryId: categoryName, // Use category name as ID
    name: categoryName,
    description: `Explore books in ${categoryName} category`,
    icon: categoryIcons[categoryName] || "📚",
    color: categoryColors[categoryName] || "#6366f1",
    bookCount: 0, // Can be updated later if needed
  }));
};

/**
 * Categories Subscription Page
 */
export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const user = getUser();

  // Use hardcoded categories
  const hardcodedCategories = useMemo(() => getHardcodedCategories(), []);

  // Fetch user subscriptions
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useUserSubscriptions();
  const subscribedCategories = subscriptionsData?.data?.categories || [];

  // Mutations
  const subscribeMutation = useSubscribeToCategory();
  const unsubscribeMutation = useUnsubscribeFromCategory();

  // Create a set of subscribed category IDs for quick lookup
  const subscribedCategoryIds = useMemo(() => {
    return new Set(subscribedCategories.map(sub => sub.categoryId));
  }, [subscribedCategories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return hardcodedCategories;
    const query = searchQuery.toLowerCase();
    return hardcodedCategories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
    );
  }, [hardcodedCategories, searchQuery]);

  // Handle subscribe
  const handleSubscribe = async (category) => {
    try {
      await subscribeMutation.mutateAsync({
        categoryId: category.categoryId,
        categoryName: category.name
      });
      toast.success(`Subscribed to ${category.name}!`, {
        description: "You'll receive notifications for new books in this category."
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to subscribe";
      toast.error("Subscribe Failed", { description: errorMsg });
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async (category) => {
    try {
      await unsubscribeMutation.mutateAsync(category.categoryId);
      toast.success(`Unsubscribed from ${category.name}`, {
        description: "You'll no longer receive notifications for this category."
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to unsubscribe";
      toast.error("Unsubscribe Failed", { description: errorMsg });
    }
  };

  const isLoading = isLoadingSubscriptions;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <NotificationsPanel />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-heading">Book Categories</h1>
            <p className="text-sm text-muted-foreground">
              Subscribe to categories to get notified when new books are added
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{subscribedCategories.length} subscribed</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Tag className="w-12 h-12 mb-4 opacity-50" />
            <p>No categories found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const isSubscribed = subscribedCategoryIds.has(category.categoryId);
              const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending;
              
              return (
                <div
                  key={category.categoryId}
                  className={`relative p-5 rounded-lg border transition-all ${
                    isSubscribed 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Subscribed badge */}
                  {isSubscribed && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        <CheckCircle className="w-3 h-3" />
                        Subscribed
                      </span>
                    </div>
                  )}

                  {/* Category Icon */}
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || "📚"}
                  </div>

                  {/* Category Info */}
                  <h3 className="font-semibold text-heading mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {category.description || "Explore books in this category"}
                  </p>

                  {/* Book count */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <BookOpen className="w-4 h-4" />
                    <span>{category.bookCount || 0} books</span>
                  </div>

                  {/* Subscribe/Unsubscribe Button */}
                  <Button
                    variant={isSubscribed ? "outline" : "default"}
                    size="sm"
                    className="w-full border-gray-400 py-5!"
                    disabled={isPending}
                    onClick={() => 
                      isSubscribed 
                        ? handleUnsubscribe(category) 
                        : handleSubscribe(category)
                    }
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
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
