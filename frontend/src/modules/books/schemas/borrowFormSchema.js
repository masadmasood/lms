import * as z from "zod";

/**
 * Zod Schema for Borrow Form Validation
 */
export const borrowFormSchema = z.object({
  borrowerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  borrowDuration: z
    .number()
    .min(1, { message: "Duration must be at least 1 day" })
    .max(14, { message: "Duration cannot exceed 14 days" })
    .int({ message: "Duration must be a whole number" }),
});

/**
 * Default form values for borrow form
 */
export const borrowFormDefaults = {
  borrowerName: "",
  email: "",
  borrowDuration: 7,
};

export default borrowFormSchema;

