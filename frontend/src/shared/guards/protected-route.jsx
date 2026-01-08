import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/auth-context";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, validateToken } = useAuth();

  useEffect(() => {
    // Validate token on mount
    if (isAuthenticated) {
      validateToken().catch(() => {
        toast.error("Session expired", {
          description: "Your session has expired. Please login again.",
        });
      });
    }
  }, [isAuthenticated, validateToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

