import { Input } from "@/shared/components/ui/input";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Link } from "react-router";
import NotificationsPanel from "@/modules/subscriptions/components/NotificationsPanel";

/**
 * BooksHeader Component - Page header with breadcrumb and search
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Callback when search changes
 */
export function BooksHeader({ searchQuery, onSearchChange }) {
  return (
    <>
      {/* Breadcrumb Header */}
      <header className="flex h-17 shrink-0 items-center justify-between gap-2 px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="bg-transparent hover:bg-transparent hover:text-primary" />
          <Breadcrumb className="border-l border-gray-400/80 px-2.5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="text-gray-500">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-700">
                  Book Catalog
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <NotificationsPanel />
      </header>

      {/* Page Title & Controls */}
      <div className="flex items-end justify-between mb-8 p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-heading mb-1">Book Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Discover and borrow from our extensive collection of books
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-11 border-border!"
          />
        </div>
      </div>
    </>
  );
}

export default BooksHeader;

