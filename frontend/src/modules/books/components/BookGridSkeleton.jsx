import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * BookGridSkeleton Component - Loading skeleton for book grid
 * @param {Object} props
 * @param {number} props.count - Number of skeleton cards to display
 */
export function BookGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, index) => (
        <Card key={index} className="overflow-hidden p-0 gap-0 shadow-none border-border rounded-md flex flex-col">
          <Skeleton className="w-full h-70 bg-gray-200" />
          <div className="p-5">
            <Skeleton className="h-6 w-3/4 mb-2 bg-gray-200" />
            <Skeleton className="h-4 w-1/2 mb-3 bg-gray-200" />
            <Skeleton className="h-8 w-24 bg-gray-200" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default BookGridSkeleton;

