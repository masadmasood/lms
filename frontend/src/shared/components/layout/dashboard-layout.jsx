import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  RotateCcw,
  LogOut,
  Tag,
  Bell,
} from "lucide-react";
import { useBookNotifications } from "@/shared/hooks/useBookNotifications";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Subscribe to real-time book notifications
  useBookNotifications();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/auth/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0">
        {/* Logo Section */}
        <SidebarHeader className="bg-slate-900 border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded bg-primary">
              <BookOpen className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Library MS</h1>
              <p className="text-[10px] text-slate-400 font-medium">
                University of Chenab
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* Navigation Menu */}
        <SidebarContent className="bg-slate-900 px-3 py-4">
          <SidebarMenu className="space-y-1.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/dashboard"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/dashboard"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 w-full"
                >
                  <LayoutDashboard className="size-5 shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/dashboard/books"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/dashboard/books"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/dashboard/books"
                  className="flex items-center gap-3 w-full"
                >
                  <Library className="size-5 shrink-0" />
                  <span>Book Catalog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>


            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/dashboard/borrowed-books"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/dashboard/borrowed-books"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/dashboard/borrowed-books"
                  className="flex items-center gap-3 w-full"
                >
                  <BookOpen className="size-5 shrink-0" />
                  <span>Borrowed Books</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/dashboard/return-books"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/dashboard/return-books"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/dashboard/return-books"
                  className="flex items-center gap-3 w-full"
                >
                  <RotateCcw className="size-5 shrink-0" />
                  <span>Return Books</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Divider */}
            <div className="my-3 border-t border-slate-700" />

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/categories"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/categories"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/categories"
                  className="flex items-center gap-3 w-full"
                >
                  <Tag className="size-5 shrink-0" />
                  <span>Categories</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/my-subscriptions"}
                className={`
                  h-12 px-4 rounded transition-all duration-200 font-normal
                  ${location.pathname === "/my-subscriptions"
                    ? "bg-primary! text-white!"
                    : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Link
                  to="/my-subscriptions"
                  className="flex items-center gap-3 w-full"
                >
                  <Bell className="size-5 shrink-0" />
                  <span>My Subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* User & Logout Section */}
        <SidebarFooter className="bg-slate-900 border-t border-slate-800 p-3 mt-auto">
          {/* Logout Button */}
          <Button
            className="w-full h-12 justify-start gap-3 px-4 rounded text-red-500 hover:bg-red-900/30 bg-transparent transition-all duration-200  cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="bg-slate-50">
        <div className="flex flex-1 flex-col gap-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
