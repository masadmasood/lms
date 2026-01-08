import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  Library,
  ArrowLeftRight,
  BookOpen,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useBooks } from "@/modules/books/hooks/useBooks";
import { useBorrowedBooks } from "@/modules/borrow/hooks/useBorrowedBooks";
import NotificationsPanel from "@/modules/subscriptions/components/NotificationsPanel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch all books
  const { data: allBooks = [], isLoading: isLoadingAll } = useBooks();

  // Fetch available books only
  const { data: availableBooks = [], isLoading: isLoadingAvailable } = useBooks({
    status: 'available'
  });

  // Fetch current user's borrowed books
  const { data: userBorrowedBooks = [], isLoading: isLoadingBorrowed } = useBorrowedBooks();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Calculate stats
  const totalBooks = allBooks?.length || 0;
  const availableBooksCount = availableBooks?.length || 0;
  const borrowedBooksCount = totalBooks - availableBooksCount;

  // User's active borrowed books count (status is BORROWED or active)
  const userActiveBorrowedCount = useMemo(() => {
    return userBorrowedBooks.filter(book => {
      const status = book.status?.toLowerCase();
      return status === "borrowed" || status === "active";
    }).length;
  }, [userBorrowedBooks]);

  // Recent activity (both borrowed and returned books, sorted by date, latest first)
  const recentActivity = useMemo(() => {
    const activities = userBorrowedBooks.map(book => {
      // Create activity for borrow
      const borrowActivity = {
        id: `${book.id}-borrow`,
        type: 'borrow',
        bookTitle: book.bookTitle,
        bookAuthor: book.bookAuthor || book.author || "Unknown",
        date: book.borrowDate,
        status: book.status,
        dueDate: book.dueDate
      };

      // Create activity for return (if returned)
      const activitiesList = [borrowActivity];

      const normalizedStatus = book.status?.toLowerCase();
      if (normalizedStatus === "returned" && book.returnDate) {
        activitiesList.push({
          id: `${book.id}-return`,
          type: 'return',
          bookTitle: book.bookTitle,
          bookAuthor: book.bookAuthor || book.author || "Unknown",
          date: book.returnDate,
          status: book.status,
          dueDate: book.dueDate
        });
      }

      return activitiesList;
    }).flat();

    // Sort by date (latest first)
    return activities
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Latest first
      })
      .slice(0, 6); // Show only 6 most recent activities
  }, [userBorrowedBooks]);


  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-17 shrink-0 items-center justify-between gap-2 px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="bg-transparent hover:bg-transparent hover:text-primary" />
          <Breadcrumb className="border-l border-gray-400/80 px-2.5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage asChild>
                  <span className="text-gray-700">Dashboard</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <NotificationsPanel />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-heading mb-1 capitalize">
            Welcome back, {user?.name || user?.username || user?.email || "User"} 👋🏻
          </h1>
          <p className="text-base text-muted-foreground">
            Your personalized library dashboard
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 p-5 rounded-md border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Books</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoadingAll ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    totalBooks.toLocaleString()
                  )}
                </p>
              </div>
              <div className="w-11 h-11 bg-primary/10 rounded-md flex items-center justify-center">
                <Library className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-success/5 p-5 rounded-md border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Books</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoadingAvailable ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    availableBooksCount.toLocaleString()
                  )}
                </p>
              </div>
              <div className="w-11 h-11 bg-success/10 rounded-md flex items-center justify-center">
                <Library className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-accent/5 p-5 rounded-md border border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">My Borrowed Books</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoadingBorrowed ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    userActiveBorrowedCount.toLocaleString()
                  )}
                </p>
              </div>
              <div className="w-11 h-11 bg-accent/10 rounded-md flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold text-heading mb-4">Recent Activity</h4>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {isLoadingBorrowed ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading recent activity...
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    // Check if book is overdue (only for borrowed books)
                    const isOverdue = activity.type === 'borrow' &&
                      activity.status === 'active' &&
                      activity.dueDate &&
                      new Date(activity.dueDate) < new Date();

                    // Calculate days ago
                    const activityDate = new Date(activity.date);
                    const now = new Date();
                    const diffTime = Math.abs(now - activityDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const timeAgo = diffDays === 0 ? "Today" : diffDays === 1 ? "1d ago" : `${diffDays}d ago`;

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-4 rounded-md bg-muted hover:scale-[1.01] transition-transform"
                      >
                        <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${activity.type === 'return'
                          ? "bg-success"
                          : isOverdue
                            ? "bg-red-500"
                            : "bg-primary"
                          }`}>
                          {activity.type === 'return' ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : isOverdue ? (
                            <Clock className="w-4 h-4 text-white" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-body">
                            {activity.type === 'return' ? (
                              <>
                                You <span className="font-medium">returned</span> "{activity.bookTitle}"
                              </>
                            ) : isOverdue ? (
                              <>
                                <span className="font-medium text-red-600">Overdue:</span> "{activity.bookTitle}"
                              </>
                            ) : (
                              <>
                                You <span className="font-medium">borrowed</span> "{activity.bookTitle}"
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {activity.bookAuthor}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs mt-1">Start borrowing books to see your activity here</p>
                  </div>
                )}
              </div>
            </ScrollArea>

          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-lg font-semibold text-heading mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* View Books */}
              <Link
                to="/dashboard/books"
                className="group p-5 rounded-md bg-primary/5 border border-primary/20 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center mb-3">
                  <Library className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-heading mb-1">Book Catalog</h3>
                <p className="text-xs text-muted-foreground mb-3">Browse library collection</p>
                <div className="flex items-center text-xs font-medium text-primary">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Borrow Books */}
              <Link
                to="/dashboard/borrowed-books"
                className="group p-5 rounded-md bg-success/5 border border-success/20 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 bg-success/10 rounded-md flex items-center justify-center mb-3">
                  <ArrowLeftRight className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-base font-semibold text-heading mb-1">Borrowed Books</h3>
                <p className="text-xs text-muted-foreground mb-3">Request to borrow</p>
                <div className="flex items-center text-xs font-medium text-success">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* My Borrowed Books */}
              <Link
                to="/dashboard/borrowed-books"
                className="group p-5 rounded-md bg-accent/5 border border-accent/20 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-heading mb-1">My Books</h3>
                <p className="text-xs text-muted-foreground mb-3">Your borrowed books</p>
                <div className="flex items-center text-xs font-medium text-accent">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Return Books */}
              <Link
                to="/dashboard/return-books"
                className="group p-5 rounded bg-warning/5 border border-warning/20 hover:scale-[1.02] transition-transform"
              >
                <div className="w-10 h-10 bg-warning/10 rounded flex items-center justify-center mb-3">
                  <RotateCcw className="w-5 h-5 text-warning" />
                </div>
                <h3 className="text-base font-semibold text-heading mb-1">Return Books</h3>
                <p className="text-xs text-muted-foreground mb-3">Return borrowed books</p>
                <div className="flex items-center text-xs font-medium text-warning">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>



      </main>
    </div>
  );
}
