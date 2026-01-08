import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { UserPlus, Loader2, User, Mail, Lock, Info } from "lucide-react";
import { adminService } from "../services/adminService";

// Validation schema
const addStudentSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Add Student Page - Form styled like login page
 */
export default function AddStudent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Get current admin user for activity log
  const getCurrentAdminId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData)?._id;
    }
    return null;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Add student via API
      await adminService.addStudent({
        username: data.username,
        email: data.email,
        password: data.password,
        role: "student", // Always student
      });

      // Add to activity log (admin-specific)
      addToActivityLog("Added Student", data.username);

      toast.success("Student added successfully!", {
        description: `${data.username} has been added to the system.`,
      });

      form.reset();
      navigate("/admin/students");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add student";
      toast.error("Failed to add student", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Add to activity log (admin-specific)
  const addToActivityLog = (action, details) => {
    const adminId = getCurrentAdminId();
    const logKey = adminId ? `activityLog_${adminId}` : "activityLog";
    const log = JSON.parse(localStorage.getItem(logKey) || "[]");
    log.unshift({
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      action,
      details,
      user: "Admin",
    });
    localStorage.setItem(logKey, JSON.stringify(log.slice(0, 50))); // Keep last 50
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold !text-heading mb-2">Add New Student</h1>
        <p className="text-base !text-muted-foreground">
          Register a new student to the library system
        </p>
      </div>

      {/* Form Card */}
      <div className="!bg-white !border !border-gray-200 !rounded-lg p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        placeholder="Enter student username"
                        className={`!pl-10 !h-12 !text-slate-900 placeholder:!text-slate-400 ${
                          fieldState.error
                            ? "!border-red-600 !bg-red-50 focus-visible:!border-red-600 focus-visible:!ring-red-600/50"
                            : "!border-slate-300"
                        }`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="!text-red-600" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        type="email"
                        placeholder="Enter student email"
                        className={`!pl-10 !h-12 !text-slate-900 placeholder:!text-slate-400 ${
                          fieldState.error
                            ? "!border-red-600 !bg-red-50 focus-visible:!border-red-600 focus-visible:!ring-red-600/50"
                            : "!border-slate-300"
                        }`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="!text-red-600" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        className={`!pl-10 !h-12 !text-slate-900 placeholder:!text-slate-400 ${
                          fieldState.error
                            ? "!border-red-600 !bg-red-50 focus-visible:!border-red-600 focus-visible:!ring-red-600/50"
                            : "!border-slate-300"
                        }`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="!text-red-600" />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="!bg-primary/5 !border !border-primary/20 !rounded-md p-4 flex gap-3">
              <Info className="w-5 h-5 !text-primary shrink-0 mt-0.5" />
              <p className="text-sm !text-slate-700">
                This user will be added as a <strong>Student</strong> with limited permissions.
                Students can only view and borrow books.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full !h-12 !text-base !font-semibold mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Adding Student...
                </>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Add Student
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
