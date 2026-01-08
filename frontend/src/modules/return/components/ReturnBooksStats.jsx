import React from "react";

export function ReturnBooksStats({ books }) {
  const activeCount = books.filter(b => {
    if (!b.dueDate) return true;
    const due = new Date(b.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due >= today;
  }).length;
  
  const overdueCount = books.filter(b => {
    if (!b.dueDate) return false;
    const due = new Date(b.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  return (
    <div className="mt-6 flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-heading">{books.length}</span> book(s) to return
      </p>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Active: <span className="font-semibold text-green-600">
            {activeCount}
          </span>
        </span>
        <span className="text-muted-foreground">
          Overdue: <span className="font-semibold text-red-600">
            {overdueCount}
          </span>
        </span>
      </div>
    </div>
  );
}

