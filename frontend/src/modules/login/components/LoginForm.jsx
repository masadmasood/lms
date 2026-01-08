import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff, BookOpen, Lock, Mail } from "lucide-react";
import { loginSchema, loginFormDefaults } from "../schemas/loginSchema";
import { useLogin } from "../hooks/useLogin";

/**
 * LoginForm Component - Login form with validation
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  // Form setup with Zod validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefaults,
  });

  // Login mutation hook
  const loginMutation = useLogin();

  // Handle form submission
  const onSubmit = (data) => {
    loginMutation.mutate({
      loginId: data.email,
      password: data.password,
    });
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 lg:p-8 xl:p-12 bg-white">
      <div className="w-full max-w-md mx-auto space-y-6 xl:space-y-8">
        {/* Mobile Logo */}
        <MobileLogo />

        {/* Header */}
        <FormHeader />

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 xl:space-y-6"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        className={`pl-10 h-12 text-slate-900 placeholder:text-slate-400 ${
                          fieldState.error
                            ? "border-red-600 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/50"
                            : "border-slate-300"
                        }`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        className={`pl-10 pr-10 h-12 text-slate-900 placeholder:text-slate-400 ${
                          fieldState.error
                            ? "border-red-600 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/50"
                            : "border-slate-300"
                        }`}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold mt-1.5"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

/**
 * MobileLogo - Logo shown only on mobile
 */
function MobileLogo() {
  return (
    <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-4">
      <div className="p-3 bg-slate-100 rounded-xl">
        <BookOpen className="size-8 text-slate-700" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Library Management</h1>
    </div>
  );
}

/**
 * FormHeader - Header text for the form
 */
function FormHeader() {
  return (
    <div className="space-y-2 text-center lg:text-left">
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
        Welcome back
      </h2>
      <p className="text-sm lg:text-base text-slate-600">
        Enter your credentials to access your account
      </p>
    </div>
  );
}

export default LoginForm;

