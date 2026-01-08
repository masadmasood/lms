import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Search, BookPlus, Trash2, Library, AlertTriangle, Loader2 } from "lucide-react";
import { useBooks } from "@/modules/books/hooks/useBooks";
import { adminService } from "../services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { BOOKS_QUERY_KEY } from "@/modules/books/hooks/useBooks";

/**
 * View Books Page - List all books with delete option
 */
export default function ViewBooks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: books = [], isLoading } = useBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter books based on search
  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.bookId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete click
  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedBook) return;

    // Get current admin user for activity log
    const getCurrentAdminId = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData)?._id;
      }
      return null;
    };

    setIsDeleting(true);
    try {
      await adminService.deleteBook(selectedBook.bookId);

      // Add to activity log (admin-specific)
      const adminId = getCurrentAdminId();
      const logKey = adminId ? `activityLog_${adminId}` : "activityLog";
      const log = JSON.parse(localStorage.getItem(logKey) || "[]");
      log.unshift({
        date: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        action: "Deleted Book",
        details: selectedBook.title,
        user: "Admin",
      });
      localStorage.setItem(logKey, JSON.stringify(log.slice(0, 50)));

      // Refetch ALL books queries immediately for instant UI update
      await queryClient.refetchQueries({ 
        queryKey: BOOKS_QUERY_KEY,
        type: 'all' // Refetch all queries that start with BOOKS_QUERY_KEY
      });

      toast.success("Book deleted successfully!", {
        description: `"${selectedBook.title}" has been removed from the catalog.`,
      });

      setDeleteDialogOpen(false);
      setSelectedBook(null);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to delete book";
      toast.error("Failed to delete book", { description: errorMsg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold !text-heading mb-1">View Books</h1>
          <p className="text-base !text-muted-foreground">Manage library book catalog</p>
        </div>
        <Button onClick={() => navigate("/admin/add-book")} className="!h-11">
          <BookPlus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 !text-slate-400" />
        <Input
          placeholder="Search by title, author, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!pl-10 !h-12 !border-slate-300"
        />
      </div>

      {/* Books Table */}
      <div className="!bg-white !border !border-gray-200 !rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="!bg-slate-50 !border-b !border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">Book</th>
              <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">Author</th>
              <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">Category</th>
              <th className="px-6 py-4 text-center text-sm font-semibold !text-slate-700">Copies</th>
              <th className="px-6 py-4 text-center text-sm font-semibold !text-slate-700">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold !text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y !divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center !text-slate-500">
                  Loading books...
                </td>
              </tr>
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr key={book.bookId} className="hover:!bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover !rounded"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40x56?text=No+Image";
                        }}
                      />
                      <div>
                        <div className="font-medium !text-slate-800 line-clamp-1">{book.title}</div>
                        <div className="text-xs !text-slate-500">{book.bookId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm !text-slate-600">{book.author}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium !bg-slate-100 !text-slate-700 !rounded">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className="font-medium">{book.availableCopies}</span>
                    <span className="!text-slate-400">/{book.totalCopies}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium !rounded-full ${
                        book.status === "available"
                          ? "!bg-success/10 !text-success"
                          : "!bg-red-100 !text-red-700"
                      }`}
                    >
                      {book.status === "available" ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-red-600 hover:!text-red-700 hover:!bg-red-50"
                      onClick={() => handleDeleteClick(book)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Library className="w-12 h-12 !text-gray-300" />
                    <p className="!text-slate-500">No books found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin/add-book")}
                      className="!h-10"
                    >
                      <BookPlus className="w-4 h-4 mr-2" />
                      Add First Book
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="text-sm !text-muted-foreground">
        Total Books: <span className="font-semibold !text-heading">{filteredBooks.length}</span>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="!bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 !text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="!text-slate-600">
              Are you sure you want to delete this book? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedBook && (
            <div className="flex items-center gap-4 p-4 !bg-slate-50 !rounded-lg">
              <img
                src={selectedBook.coverImageUrl}
                alt={selectedBook.title}
                className="w-12 h-16 object-cover !rounded"
              />
              <div>
                <p className="font-medium !text-slate-800">{selectedBook.title}</p>
                <p className="text-sm !text-slate-500">By: {selectedBook.author}</p>
              </div>
            </div>
          )}

          {selectedBook?.availableCopies < selectedBook?.totalCopies && (
            <div className="!bg-warning/10 !border !border-warning/20 !rounded-lg p-3">
              <p className="text-sm !text-warning">
                <strong>Warning:</strong> Some copies of this book are currently borrowed.
                Deletion may fail.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="!h-11"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="!h-11 bg-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Book
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
