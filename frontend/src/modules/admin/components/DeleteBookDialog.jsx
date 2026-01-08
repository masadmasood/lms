import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteBook } from "../hooks/useAdminBooks";

/**
 * DeleteBookDialog Component - Confirmation dialog for deleting books
 */
export function DeleteBookDialog({ open, onOpenChange, book }) {
  // Delete book mutation
  const deleteBookMutation = useDeleteBook({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  // Handle delete confirmation
  const handleDelete = () => {
    if (book?.bookId) {
      deleteBookMutation.mutate(book.bookId);
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Book
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this book? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-16 h-20 object-cover rounded"
            />
            <div>
              <h4 className="font-semibold text-heading">{book.title}</h4>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {book.availableCopies}/{book.totalCopies} copies available
              </p>
            </div>
          </div>

          {book.availableCopies < book.totalCopies && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Some copies are currently borrowed. Return them first.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteBookMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBookMutation.isPending || book.availableCopies < book.totalCopies}
          >
            {deleteBookMutation.isPending ? (
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
  );
}

export default DeleteBookDialog;
