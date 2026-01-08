/*
  My Subscriptions Page
  
  Shows user's subscribed categories and books with management options.
*/

import { useState, useMemo } from "react";
import { Link } from "react-router";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  Bell,
  BellOff,
  BookOpen,
  Tag,
  Loader2,
  Trash2,
  Plus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { 
  useUserSubscriptions, 
  useUnsubscribeFromCategory, 
  useUnsubscribeFromBook 
} from "./hooks/useSubscriptions";
import NotificationsPanel from "./components/NotificationsPanel";
import { getUser } from "@/shared/utils/auth";
import { useBooks } from "@/modules/books/hooks/useBooks";

/**
 * My Subscriptions Page
 */
export default function MySubscriptionsPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("categories");

  // Fetch user subscriptions
  const { data: subscriptionsData, isLoading } = useUserSubscriptions();
  const subscribedCategories = subscriptionsData?.data?.categories || [];
  const subscribedBooks = subscriptionsData?.data?.books || [];

  // Get subscribed category names
  const subscribedCategoryNames = useMemo(() => {
    return subscribedCategories.map(sub => sub.categoryName || sub.categoryId);
  }, [subscribedCategories]);

  // Fetch books from subscribed categories
  const { data: allBooks = [], isLoading: isLoadingBooks } = useBooks();
  
  // Filter books to show only those from subscribed categories
  const booksFromSubscribedCategories = useMemo(() => {
    if (subscribedCategoryNames.length === 0) return [];
    
    return allBooks.filter(book => 
      subscribedCategoryNames.includes(book.category)
    );
  }, [allBooks, subscribedCategoryNames]);

  // Combine specific book subscriptions with books from subscribed categories
  // Remove duplicates (if a book is both subscribed and in a subscribed category)
  const allSubscribedBooks = useMemo(() => {
    const bookMap = new Map();
    
    // Add books from subscribed categories
    booksFromSubscribedCategories.forEach(book => {
      bookMap.set(book.bookId, {
        bookId: book.bookId,
        bookTitle: book.title,
        bookCategory: book.category,
        author: book.author,
        coverImageUrl: book.coverImageUrl,
        isFromCategory: true,
        subscribedAt: new Date().toISOString() // Use current date as fallback
      });
    });
    
    // Add specific book subscriptions (these take priority)
    subscribedBooks.forEach(sub => {
      bookMap.set(sub.bookId, {
        bookId: sub.bookId,
        bookTitle: sub.bookTitle,
        bookCategory: sub.bookCategory,
        author: sub.author || '',
        coverImageUrl: sub.coverImageUrl || '',
        isFromCategory: false,
        subscribedAt: sub.subscribedAt
      });
    });
    
    return Array.from(bookMap.values());
  }, [booksFromSubscribedCategories, subscribedBooks]);

  // Mutations
  const unsubscribeCategoryMutation = useUnsubscribeFromCategory();
  const unsubscribeBookMutation = useUnsubscribeFromBook();

  // Handle unsubscribe from category
  const handleUnsubscribeCategory = async (categoryId, categoryName) => {
    try {
      await unsubscribeCategoryMutation.mutateAsync(categoryId);
      toast.success(`Unsubscribed from ${categoryName}`);
    } catch (error) {
      toast.error("Failed to unsubscribe");
    }
  };

  // Handle unsubscribe from book
  const handleUnsubscribeBook = async (bookId, bookTitle) => {
    try {
      await unsubscribeBookMutation.mutateAsync(bookId);
      toast.success(`Unsubscribed from "${bookTitle}"`);
    } catch (error) {
      toast.error("Failed to unsubscribe");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

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
                <BreadcrumbPage>My Subscriptions</BreadcrumbPage>
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
            <h1 className="text-2xl font-bold text-heading">My Subscriptions</h1>
            <p className="text-sm text-muted-foreground">
              Manage your category and book subscriptions
            </p>
          </div>
          <Link to="/categories">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Browse Categories
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="w-4 h-4" />
              Categories ({subscribedCategories.length})
            </TabsTrigger>
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Books ({allSubscribedBooks.length})
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin !text-blue-600" />
              </div>
            ) : subscribedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 !text-gray-600 !border !border-gray-200 !rounded-lg !bg-gray-50 py-12 px-6">
                <Bell className="w-16 h-16 mb-4 !text-gray-400" />
                <p className="!text-lg !font-semibold !text-gray-800 mb-2">No Category Subscriptions</p>
                <p className="!text-sm !text-gray-600 mb-6 text-center max-w-md">
                  Subscribe to categories to receive notifications when new books are added
                </p>
                <Link to="/categories">
                  <Button variant="outline" className="!border-gray-300 !text-gray-700 hover:!bg-gray-100">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subscribedCategories.map((subscription) => (
                  <div
                    key={subscription._id}
                    className="group relative !p-6 !rounded-xl !border !border-gray-200 !bg-white hover:!shadow-lg hover:!border-indigo-300 !transition-all !duration-300 overflow-hidden"
                  >
                    {/* Active Subscription Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 !px-2.5 !py-1 !text-xs !font-semibold !rounded-full !bg-green-100 !text-green-700 !border !border-green-200">
                        <Bell className="w-3 h-3" />
                        Active
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Category Icon */}
                      <div className="flex items-center gap-4">
                        <div className="!w-16 !h-16 !rounded-xl !bg-gradient-to-br !from-indigo-500 !to-purple-600 flex items-center justify-center !shadow-md group-hover:!scale-110 !transition-transform !duration-300">
                          <Tag className="w-8 h-8 !text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="!font-bold !text-lg !text-gray-900 group-hover:!text-indigo-600 !transition-colors line-clamp-2">
                            {subscription.categoryName}
                          </h3>
                        </div>
                      </div>

                      {/* Subscription Info */}
                      <div className="!pt-4 !border-t !border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 !text-xs !text-gray-600">
                            <Calendar className="w-4 h-4 !text-gray-400" />
                            <span className="!font-medium">
                              Subscribed {formatDate(subscription.subscribedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Unsubscribe Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="!w-full !mt-2 !border-gray-300 !text-gray-700 hover:!bg-red-50 hover:!border-red-300 hover:!text-red-600 !transition-colors !font-medium"
                        disabled={unsubscribeCategoryMutation.isPending}
                        onClick={() => handleUnsubscribeCategory(
                          subscription.categoryId, 
                          subscription.categoryName
                        )}
                      >
                        {unsubscribeCategoryMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Unsubscribing...
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4 mr-2" />
                            Unsubscribe
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books">
            {isLoading || isLoadingBooks ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin !text-blue-600" />
              </div>
            ) : allSubscribedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 !text-gray-600 !border !border-gray-200 !rounded-lg !bg-gray-50 py-12 px-6">
                <BookOpen className="w-16 h-16 mb-4 !text-gray-400" />
                <p className="!text-lg !font-semibold !text-gray-800 mb-2">No Books Available</p>
                <p className="!text-sm !text-gray-600 mb-6 text-center max-w-md">
                  {subscribedCategoryNames.length === 0 
                    ? "Subscribe to categories to see books from those categories"
                    : "No books found in your subscribed categories"}
                </p>
                {subscribedCategoryNames.length === 0 ? (
                  <Link to="/categories">
                    <Button variant="outline" className="!border-gray-300 !text-gray-700 hover:!bg-gray-100">
                      Browse Categories
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard/books">
                    <Button variant="outline" className="!border-gray-300 !text-gray-700 hover:!bg-gray-100">
                      Browse All Books
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allSubscribedBooks.map((book) => (
                  <div
                    key={book.bookId}
                    className="group relative !p-5 !rounded-xl !border !border-gray-200 !bg-white hover:!shadow-lg hover:!border-blue-300 !transition-all !duration-300 overflow-hidden"
                  >
                    {/* Badge for category subscription */}
                    {book.isFromCategory && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 !px-2 !py-1 !text-xs !font-medium !rounded-full !bg-blue-100 !text-blue-700 !border !border-blue-200">
                          <Bell className="w-3 h-3" />
                          Category
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-4">
                      {/* Book Cover */}
                      <div className="relative w-full aspect-[3/4] !rounded-lg !overflow-hidden !bg-gray-100 !border !border-gray-200 group-hover:!scale-105 !transition-transform !duration-300">
                        {book.coverImageUrl ? (
                          <img 
                            src={book.coverImageUrl} 
                            alt={book.bookTitle}
                            className="w-full h-full !object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center !bg-gradient-to-br !from-blue-50 !to-indigo-50">
                            <BookOpen className="w-12 h-12 !text-blue-400" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex flex-col gap-2 flex-1">
                        <h3 className="!font-semibold !text-gray-900 !text-base line-clamp-2 group-hover:!text-blue-600 !transition-colors">
                          {book.bookTitle}
                        </h3>
                        
                        {book.author && (
                          <p className="!text-sm !text-gray-600 line-clamp-1">
                            by <span className="!font-medium !text-gray-700">{book.author}</span>
                          </p>
                        )}
                        
                        {book.bookCategory && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 !px-2.5 !py-1 !text-xs !font-medium !rounded-md !bg-indigo-50 !text-indigo-700 !border !border-indigo-200">
                              <Tag className="w-3 h-3" />
                              {book.bookCategory}
                            </span>
                          </div>
                        )}
                        
                        {/* Subscription Info */}
                        <div className="flex items-center justify-between mt-2 pt-2 !border-t !border-gray-100">
                          {book.isFromCategory ? (
                            <div className="flex items-center gap-1.5 !text-xs !text-gray-500">
                              <Bell className="w-3.5 h-3.5 !text-blue-500" />
                              <span>From subscribed category</span>
                            </div>
                          ) : book.subscribedAt ? (
                            <div className="flex items-center gap-1.5 !text-xs !text-gray-500">
                              <Calendar className="w-3.5 h-3.5 !text-gray-400" />
                              <span>Subscribed {formatDate(book.subscribedAt)}</span>
                            </div>
                          ) : null}
                          
                          {!book.isFromCategory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="!h-8 !w-8 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 !transition-colors"
                              disabled={unsubscribeBookMutation.isPending}
                              onClick={() => handleUnsubscribeBook(
                                book.bookId, 
                                book.bookTitle
                              )}
                            >
                              {unsubscribeBookMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <BellOff className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
