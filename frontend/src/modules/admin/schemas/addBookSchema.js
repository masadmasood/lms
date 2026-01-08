import { z } from "zod";

/**
 * Zod Schema for Add Book Form Validation
 */
export const addBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),
  author: z
    .string()
    .min(1, "Author is required")
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name must not exceed 100 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  pages: z
    .number({ invalid_type_error: "Pages must be a number" })
    .min(1, "Pages must be at least 1")
    .max(10000, "Pages must not exceed 10000"),
  totalCopies: z
    .number({ invalid_type_error: "Total copies must be a number" })
    .min(1, "Total copies must be at least 1")
    .max(1000, "Total copies must not exceed 1000"),
  coverImageUrl: z
    .string()
    .min(1, "Cover image URL is required")
    .url("Must be a valid URL"),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  language: z
    .string()
    .optional(),
});

/**
 * Default form values for add book form
 */
export const addBookFormDefaults = {
  title: "",
  author: "",
  category: "",
  pages: 100,
  totalCopies: 5,
  coverImageUrl: "",
  description: "",
  language: "English",
};

// Category options
export const bookCategories = [
  "Technology",
  "Science",
  "Mathematics",
  "Literature",
  "History",
  "Business",
  "Self-Help",
  "Fiction",
  "Non-Fiction",
  "Education",
  "Art",
  "Music",
  "Philosophy",
  "Psychology",
  "Health",
  "Other",
];

export default addBookSchema;
