import React from "react";
import { User, Calendar, BookOpen, Clock, CheckCircle2 } from "lucide-react";

/**
 * BorrowedBooksTable Component - Displays table of borrowed books
 * @param {Object} props
 * @param {Array} props.books - Array of borrowed book records
 * @param {string} props.searchQuery - Search query for filtering
 * @param {boolean} props.isLoading - Loading state
 */
export function BorrowedBooksTable({ books, searchQuery, isLoading }) {
  // Books are already filtered in parent component, no need to filter again
  const displayBooks = Array.isArray(books) ? books : [];

  // Get status color (handles both 'returned'/'RETURNED' and 'borrowed'/'BORROWED')
  const getStatusColor = (status, dueDate) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "returned") {
      return "text-gray-600 bg-gray-50 border-gray-200";
    }
    
    // Check if overdue
    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return "text-red-600 bg-red-50 border-red-200";
      }
    }
    
    return "text-green-600 bg-green-50 border-green-200";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status label (handles both 'returned'/'RETURNED' and 'borrowed'/'BORROWED')
  const getStatusLabel = (status, dueDate) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "returned") return "Returned";
    
    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return "Overdue";
      }
    }
    
    return "Active";
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-md overflow-hidden bg-white">
        <div className="p-12 text-center">
          <p className="text-muted-foreground">Loading borrowed books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="p-6 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                Book Details
              </th>
              <th className="p-6 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                Author
              </th>
              <th className="p-6 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                Borrower / Email
              </th>
              <th className="p-6 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                Borrowed Date
              </th>
              <th className="p-6 text-left text-xs font-semibold text-heading uppercase tracking-wide">
                Due Date
              </th>
              <th className="p-6 text-center text-xs font-semibold text-heading uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayBooks.length > 0 ? (
              displayBooks.map((book) => (
                <tr
                  key={book.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-heading">
                          {book.bookTitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{book.bookAuthor || book.author || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm !text-heading font-medium">
                      {book.memberName || book.borrowerName || "N/A"}
                    </div>
                    <div className="text-xs !text-muted-foreground">
                      {book.email || book.memberEmail || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(book.borrowDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(book.dueDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(
                        book.status,
                        book.dueDate
                      )}`}
                    >
                      {getStatusLabel(book.status, book.dueDate) === "Active" && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {getStatusLabel(book.status, book.dueDate) === "Overdue" && (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {getStatusLabel(book.status, book.dueDate)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "No books found matching your search"
                        : "You haven't borrowed any books yet"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BorrowedBooksTable;

