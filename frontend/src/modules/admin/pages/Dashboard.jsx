import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Library,
  UserPlus,
  BookPlus,
  ChevronRight,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useBooks } from "@/modules/books/hooks/useBooks";
import { adminService } from "../services/adminService";

/**
 * Admin Dashboard - Matches student dashboard style exactly
 */
export default function AdminDashboard() {
  const [activityLog, setActivityLog] = useState([]);
  const [user, setUser] = useState(null);
  const { data: books = [], isLoading: isLoadingBooks } = useBooks();

  // Fetch students from API (same data for all admins)
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: adminService.getAllStudents,
    staleTime: 30000, // 30 seconds
  });

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load activity log from localStorage (admin-specific)
  useEffect(() => {
    if (user?._id) {
      const storedLog = localStorage.getItem(`activityLog_${user._id}`);
      if (storedLog) {
        setActivityLog(JSON.parse(storedLog));
      }
    }
  }, [user]);

  // Calculate stats
  const totalStudents = students.length;
  const totalBooks = books.length;
  const availableBooksCount = books.filter(b => 
    b.status?.toLowerCase() === "available"
  ).length;

  // Recent activity formatted
  const recentActivities = useMemo(() => {
    return activityLog.slice(0, 6).map((log, index) => ({
      id: index,
      type: log.action.includes("Student") ? "student" : log.action.includes("Delete") ? "delete" : "book",
      action: log.action,
      details: log.details,
      date: log.date,
    }));
  }, [activityLog]);

  return (
    <div className="flex flex-col w-full">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold !text-heading mb-1 capitalize">
          Welcome back, {user?.username || user?.name || "Admin"} 👋🏻
        </h1>
        <p className="text-base !text-muted-foreground">
          Manage your library system efficiently
        </p>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="!bg-primary/5 p-5 !rounded-md !border !border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm !text-muted-foreground mb-1">Total Students</p>
              <p className="text-2xl font-bold !text-heading">
                {isLoadingStudents ? (
                  <span className="!text-muted-foreground">Loading...</span>
                ) : (
                  totalStudents.toLocaleString()
                )}
              </p>
            </div>
            <div className="w-11 h-11 !bg-primary/10 !rounded-md flex items-center justify-center">
              <Users className="w-5 h-5 !text-primary" />
            </div>
          </div>
        </div>

        <div className="!bg-success/5 p-5 !rounded-md !border !border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm !text-muted-foreground mb-1">Total Books</p>
              <p className="text-2xl font-bold !text-heading">
                {isLoadingBooks ? (
                  <span className="!text-muted-foreground">Loading...</span>
                ) : (
                  totalBooks.toLocaleString()
                )}
              </p>
            </div>
            <div className="w-11 h-11 !bg-success/10 !rounded-md flex items-center justify-center">
              <Library className="w-5 h-5 !text-success" />
            </div>
          </div>
        </div>

        <div className="!bg-accent/5 p-5 !rounded-md !border !border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm !text-muted-foreground mb-1">Available Books</p>
              <p className="text-2xl font-bold !text-heading">
                {isLoadingBooks ? (
                  <span className="!text-muted-foreground">Loading...</span>
                ) : (
                  availableBooksCount.toLocaleString()
                )}
              </p>
            </div>
            <div className="w-11 h-11 !bg-accent/10 !rounded-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 !text-accent" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div>
          <h4 className="text-lg font-semibold !text-heading mb-4">Recent Activity</h4>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-4 !rounded-md !bg-muted hover:scale-[1.01] transition-transform"
                  >
                    <div className={`shrink-0 w-9 h-9 !rounded-md flex items-center justify-center ${
                      activity.type === 'student'
                        ? "!bg-primary"
                        : activity.type === 'delete'
                        ? "!bg-red-500"
                        : "!bg-success"
                    }`}>
                      {activity.type === 'student' ? (
                        <UserPlus className="w-4 h-4 !text-white" />
                      ) : activity.type === 'delete' ? (
                        <Clock className="w-4 h-4 !text-white" />
                      ) : (
                        <BookPlus className="w-4 h-4 !text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm !text-body">
                        <span className="font-medium">{activity.action}</span>
                      </p>
                      <p className="text-xs !text-muted-foreground truncate">
                        {activity.details}
                      </p>
                    </div>
                    <span className="text-xs !text-muted-foreground">{activity.date}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center !text-muted-foreground">
                  <Activity className="w-10 h-10 !text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-1">Start adding students or books</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-lg font-semibold !text-heading mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Add Student */}
            <Link
              to="/admin/add-student"
              className="group p-5 !rounded-md !bg-primary/5 !border !border-primary/20 hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 !bg-primary/10 !rounded-md flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5 !text-primary" />
              </div>
              <h3 className="text-base font-semibold !text-heading mb-1">Add Student</h3>
              <p className="text-xs !text-muted-foreground mb-3">Register new student</p>
              <div className="flex items-center text-xs font-medium !text-primary">
                <span>Go</span>
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* View Students */}
            <Link
              to="/admin/students"
              className="group p-5 !rounded-md !bg-success/5 !border !border-success/20 hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 !bg-success/10 !rounded-md flex items-center justify-center mb-3">
                <Users className="w-5 h-5 !text-success" />
              </div>
              <h3 className="text-base font-semibold !text-heading mb-1">View Students</h3>
              <p className="text-xs !text-muted-foreground mb-3">Manage all students</p>
              <div className="flex items-center text-xs font-medium !text-success">
                <span>Explore</span>
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Add Book */}
            <Link
              to="/admin/add-book"
              className="group p-5 !rounded-md !bg-accent/5 !border !border-accent/20 hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 !bg-accent/10 !rounded-md flex items-center justify-center mb-3">
                <BookPlus className="w-5 h-5 !text-accent" />
              </div>
              <h3 className="text-base font-semibold !text-heading mb-1">Add Book</h3>
              <p className="text-xs !text-muted-foreground mb-3">Add to catalog</p>
              <div className="flex items-center text-xs font-medium !text-accent">
                <span>Go</span>
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* View Books */}
            <Link
              to="/admin/books"
              className="group p-5 !rounded-md !bg-warning/5 !border !border-warning/20 hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 !bg-warning/10 !rounded-md flex items-center justify-center mb-3">
                <Library className="w-5 h-5 !text-warning" />
              </div>
              <h3 className="text-base font-semibold !text-heading mb-1">View Books</h3>
              <p className="text-xs !text-muted-foreground mb-3">Manage all books</p>
              <div className="flex items-center text-xs font-medium !text-warning">
                <span>Explore</span>
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
