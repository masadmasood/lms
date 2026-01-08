import { z } from "zod";

/**
 * Zod Schema for Login Form Validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

/**
 * Default form values for login form
 */
export const loginFormDefaults = {
  email: "",
  password: "",
};

export default loginSchema;

