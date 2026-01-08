import { lazy, Suspense } from "react";
import Loader from "@/shared/components/feedback/loader";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

const LoginPage = lazy(() => import("@/modules/login"));
const BooksPage = lazy(() => import("@/modules/books"));
const BorrowBooksPage = lazy(() => import("@/modules/borrow"));
const ReturnBooksPage = lazy(() => import("@/modules/return"));
const DashboardPage = lazy(() => import("@/modules/dashboard"));
const DashboardLayout = lazy(() =>
  import("@/shared/components/layout/dashboard-layout")
);

// Subscription Pages
const CategoriesPage = lazy(() => import("@/modules/subscriptions"));
const MySubscriptionsPage = lazy(() => import("@/modules/subscriptions/MySubscriptions"));

// Admin Pages
const AdminLayout = lazy(() => import("@/modules/admin/components/AdminLayout"));
const AdminDashboard = lazy(() => import("@/modules/admin/pages/Dashboard"));
const AddStudent = lazy(() => import("@/modules/admin/pages/AddStudent"));
const ViewStudents = lazy(() => import("@/modules/admin/pages/ViewStudents"));
const AddBook = lazy(() => import("@/modules/admin/pages/AddBook"));
const ViewBooks = lazy(() => import("@/modules/admin/pages/ViewBooks"));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />

          {/* Student Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="borrowed-books" element={<BorrowBooksPage />} />
            <Route path="return-books" element={<ReturnBooksPage />} />
          </Route>

          {/* Subscription Routes - Under dashboard layout */}
          <Route path="/categories" element={<DashboardLayout />}>
            <Route index element={<CategoriesPage />} />
          </Route>
          <Route path="/my-subscriptions" element={<DashboardLayout />}>
            <Route index element={<MySubscriptionsPage />} />
          </Route>

          {/* Admin Panel Routes - Completely Separate */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="students" element={<ViewStudents />} />
            <Route path="add-book" element={<AddBook />} />
            <Route path="books" element={<ViewBooks />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
