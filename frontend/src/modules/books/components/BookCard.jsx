import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { User, Calendar, ArrowRight } from "lucide-react";

/**
 * BookCard Component - Displays individual book information
 * @param {Object} props
 * @param {Object} props.book - Book data object
 * @param {Function} props.onBorrow - Callback when borrow button is clicked
 */
export function BookCard({ book, onBorrow }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const isAvailable =
    book.status === "available" && book.availableCopies > 0;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl cursor-pointer p-0 gap-0 shadow-none border-border rounded-md flex flex-col">
      {/* Book Cover with Unsplash & Skeleton */}
      <div className="relative w-full h-70 overflow-hidden bg-muted">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full bg-gray-100" />
        )}
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Black Overlay - Default (Bottom to Top Gradient) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-3 py-1 text-white text-xs font-light rounded-full border border-primary bg-primary/80 relative overflow-hidden backdrop-blur-sm">
            {book.category}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-heading line-clamp-2 mb-2">
            {book.title}
          </h3>
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{book.pages} pages</span>
              {book.availableCopies !== undefined && (
                <>
                  <span className="mx-1">•</span>
                  <span>{book.availableCopies} available</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Always at Bottom */}
        <div className="flex items-center justify-start pt-3 mt-auto">
          <Button
            className="px-3 h-8 text-xs gap-1.5"
            onClick={() => onBorrow(book)}
            disabled={!isAvailable}
          >
            <span className="px-2 gap-2 flex items-center">
              {isAvailable ? "Borrow" : "Unavailable"}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default BookCard;

