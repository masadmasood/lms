import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { setToken, setUser } from "@/shared/utils/auth";

/**
 * Handle login error messages
 * @param {Error} error - Error object from API
 */
const handleLoginError = (error) => {
  const errorMsg =
    error.response?.data?.message ||
    "Login failed. Please check your credentials.";

  if (
    errorMsg.toLowerCase().includes("user not found") ||
    errorMsg.toLowerCase().includes("user does not exist")
  ) {
    toast.error("User not found", {
      description: "Please check your email and try again.",
    });
  } else if (
    errorMsg.toLowerCase().includes("invalid password") ||
    errorMsg.toLowerCase().includes("wrong password")
  ) {
    toast.error("Invalid password", {
      description: "The password you entered is incorrect. Please try again.",
    });
  } else if (
    errorMsg.toLowerCase().includes("email and password are required")
  ) {
    toast.error("Missing credentials", {
      description: "Please enter both email and password.",
    });
  } else {
    toast.error("Login failed", {
      description: errorMsg,
    });
  }
};

/**
 * Hook to handle user login mutation using React Query
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Callback on successful login
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Mutation result with mutate function and states
 */
export const useLogin = (options = {}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Backend response structure: {success: true, message: "...", user: {...}}
      // response.data is the actual backend response
      const responseData = response.data || response;
      
      // Check for token in response data or headers (common patterns)
      const token = 
        responseData.token || 
        response.headers?.authorization?.replace('Bearer ', '') ||
        response.headers?.Authorization?.replace('Bearer ', '');

      // Extract user from response data
      // Backend returns: {success: true, message: "...", user: {_id, username, email, role}}
      const user = responseData.user;

      // Store token if available
      if (token) {
        setToken(token);
      }

      // Store user data in localStorage
      if (user) {
        setUser(user);
      }

      toast.success("Login successful!");

      // Navigate based on user role
      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin/dashboard"); // Admin goes to Admin Dashboard
        } else {
          navigate("/dashboard"); // Students go to Student Dashboard
        }
      }, 1000);

      options.onSuccess?.(response);
    },
    onError: (error) => {
      handleLoginError(error);
      options.onError?.(error);
    },
  });
};

export default useLogin;

