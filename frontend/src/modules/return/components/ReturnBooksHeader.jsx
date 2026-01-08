import React from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import NotificationsPanel from "@/modules/subscriptions/components/NotificationsPanel";

export function ReturnBooksHeader({ searchQuery, onSearchChange }) {
  return (
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
                Return Books
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <NotificationsPanel />
    </header>
  );
}

