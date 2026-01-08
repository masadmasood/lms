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
  BookPlus,
  Search,
  Trash2,
  Edit,
  Library,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useBooks } from "@/modules/books/hooks/useBooks";
import { AddBookDialog } from "./components/AddBookDialog";
import { DeleteBookDialog } from "./components/DeleteBookDialog";

/**
 * AdminDashboard - Main admin page for book management
 */
export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch all books
  const { data: books = [], isLoading } = useBooks();

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.category?.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  // Stats
  const totalBooks = books.length;
  const availableBooks = books.filter((b) => b.status === "available").length;
  const borrowedCopies = books.reduce(
    (acc, b) => acc + (b.totalCopies - b.availableCopies),
    0
  );
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);

  // Handle delete click
  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-white px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Book Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-heading">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage library books and catalog
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <BookPlus className="w-4 h-4 mr-2" />
            Add New Book
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Library}
            label="Total Books"
            value={totalBooks}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={BookOpen}
            label="Available"
            value={availableBooks}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Borrowed Copies"
            value={borrowedCopies}
            color="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={Users}
            label="Total Copies"
            value={totalCopies}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="border border-border rounded-lg bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                  Book
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                  Category
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-heading uppercase tracking-wide">
                  Available
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-heading uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-heading uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading books...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No books found
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.bookId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-heading line-clamp-1">
                            {book.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {book.bookId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {book.author}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="font-medium">{book.availableCopies}</span>
                      <span className="text-muted-foreground">/{book.totalCopies}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          book.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {book.status === "available" ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(book)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Dialogs */}
      <AddBookDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <DeleteBookDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        book={selectedBook}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 bg-white border border-border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-heading">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Re-exports
export { AddBookDialog } from "./components/AddBookDialog";
export { DeleteBookDialog } from "./components/DeleteBookDialog";
