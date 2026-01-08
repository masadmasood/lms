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
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookPlus,
  Library,
  LogOut,
  Settings,
} from "lucide-react";

/**
 * Admin Layout - Matches student dashboard style exactly
 */
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Redirect if not admin
      if (parsedUser.role !== "admin") {
        toast.error("Access denied. Admin only.");
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/auth/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/auth/login", { replace: true });
  };

  // Get current page name for breadcrumb
  const getPageName = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "Dashboard";
    if (path === "/admin/add-student") return "Add Student";
    if (path === "/admin/students") return "View Students";
    if (path === "/admin/add-book") return "Add Book";
    if (path === "/admin/books") return "View Books";
    return "Admin";
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0">
        {/* Logo Section */}
        <SidebarHeader className="!bg-slate-900 border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded !bg-primary">
              <Settings className="size-6 !text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold !text-white">Admin Panel</h1>
              <p className="text-[10px] !text-slate-400 font-medium">
                Library Management
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* Navigation Menu */}
        <SidebarContent className="!bg-slate-900 px-3 py-4">
          <SidebarMenu className="space-y-1.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/admin" || location.pathname === "/admin/dashboard"}
                className={`
                  !h-12 px-4 !rounded transition-all duration-200 !font-normal
                  ${location.pathname === "/admin" || location.pathname === "/admin/dashboard"
                    ? "!bg-primary !text-white"
                    : "!bg-transparent !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                  }
                `}
              >
                <Link
                  to="/admin/dashboard"
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
                isActive={location.pathname === "/admin/add-student"}
                className={`
                  !h-12 px-4 !rounded transition-all duration-200 !font-normal
                  ${location.pathname === "/admin/add-student"
                    ? "!bg-primary !text-white"
                    : "!bg-transparent !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                  }
                `}
              >
                <Link
                  to="/admin/add-student"
                  className="flex items-center gap-3 w-full"
                >
                  <UserPlus className="size-5 shrink-0" />
                  <span>Add Student</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/admin/students"}
                className={`
                  !h-12 px-4 !rounded transition-all duration-200 !font-normal
                  ${location.pathname === "/admin/students"
                    ? "!bg-primary !text-white"
                    : "!bg-transparent !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                  }
                `}
              >
                <Link
                  to="/admin/students"
                  className="flex items-center gap-3 w-full"
                >
                  <Users className="size-5 shrink-0" />
                  <span>View Students</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/admin/add-book"}
                className={`
                  !h-12 px-4 !rounded transition-all duration-200 !font-normal
                  ${location.pathname === "/admin/add-book"
                    ? "!bg-primary !text-white"
                    : "!bg-transparent !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                  }
                `}
              >
                <Link
                  to="/admin/add-book"
                  className="flex items-center gap-3 w-full"
                >
                  <BookPlus className="size-5 shrink-0" />
                  <span>Add Book</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/admin/books"}
                className={`
                  !h-12 px-4 !rounded transition-all duration-200 !font-normal
                  ${location.pathname === "/admin/books"
                    ? "!bg-primary !text-white"
                    : "!bg-transparent !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                  }
                `}
              >
                <Link
                  to="/admin/books"
                  className="flex items-center gap-3 w-full"
                >
                  <Library className="size-5 shrink-0" />
                  <span>View Books</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* User & Logout Section */}
        <SidebarFooter className="!bg-slate-900 border-t border-slate-800 p-3 mt-auto">
          <Button
            className="w-full !h-12 justify-start gap-3 px-4 !rounded !text-red-500 hover:!bg-red-900/30 !bg-transparent transition-all duration-200 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="!bg-slate-50">
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex h-17 shrink-0 items-center gap-2 px-4 !border-b !border-gray-200 !bg-white">
            <SidebarTrigger className="!bg-transparent hover:!bg-transparent hover:!text-primary" />
            <Breadcrumb className="!border-l !border-gray-400/80 px-2.5">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage asChild>
                    <span className="!text-gray-700">{getPageName()}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
