/**
 * BorrowedBooksStats Component - Statistics summary for borrowed books
 * @param {Object} props
 * @param {Array} props.books - Array of borrowed book records
 */
export function BorrowedBooksStats({ books }) {
  if (!books || books.length === 0) return null;

  // Check for active/borrowed status (handles both 'active', 'borrowed', 'BORROWED')
  const isActive = (status) => {
    const s = status?.toLowerCase();
    return s === "active" || s === "borrowed";
  };

  const activeCount = books.filter((b) => isActive(b.status)).length;

  const overdueCount = books.filter((b) => {
    if (!isActive(b.status) || !b.dueDate) return false;
    const due = new Date(b.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const returnedCount = books.filter((b) => b.status?.toLowerCase() === "returned").length;

  return (
    <div className="mt-6 flex items-center justify-between px-2">
      <p className="text-sm !text-muted-foreground">
        Showing{" "}
        <span className="font-semibold !text-heading">{books.length}</span>{" "}
        borrowed book(s)
      </p>
      <div className="flex items-center gap-4 text-sm">
        <span className="!text-muted-foreground">
          Active:{" "}
          <span className="font-semibold !text-success">{activeCount}</span>
        </span>
        <span className="!text-muted-foreground">
          Overdue:{" "}
          <span className="font-semibold !text-red-600">{overdueCount}</span>
        </span>
        <span className="!text-muted-foreground">
          Returned:{" "}
          <span className="font-semibold !text-slate-600">{returnedCount}</span>
        </span>
      </div>
    </div>
  );
}

export default BorrowedBooksStats;

