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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { BookPlus, Loader2, BookOpen, User, Hash, FolderOpen, FileText, Image, Link as LinkIcon } from "lucide-react";
import { adminService } from "../services/adminService";
import { bookCategories } from "../schemas/addBookSchema";

// Validation schema with ISBN
const addBookSchema = z.object({
  title: z
    .string()
    .min(1, "Book title is required")
    .min(2, "Title must be at least 2 characters"),
  author: z
    .string()
    .min(1, "Author name is required")
    .min(2, "Author must be at least 2 characters"),
  isbn: z
    .string()
    .min(1, "ISBN is required")
    .min(10, "ISBN must be at least 10 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  pages: z
    .number({ invalid_type_error: "Pages must be a number" })
    .min(1, "Pages must be at least 1"),
  totalCopies: z
    .number({ invalid_type_error: "Copies must be a number" })
    .min(1, "Must have at least 1 copy"),
  coverImageUrl: z
    .string()
    .min(1, "Cover image URL is required")
    .url("Must be a valid URL"),
  description: z.string().optional(),
});

/**
 * Add Book Page - Form styled like login page
 */
export default function AddBook() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      category: "",
      pages: 100,
      totalCopies: 5,
      coverImageUrl: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await adminService.addBook({
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        category: data.category,
        pages: data.pages,
        totalCopies: data.totalCopies,
        coverImageUrl: data.coverImageUrl,
        description: data.description || "",
        language: ["English"],
      });

      // Add to activity log
      addToActivityLog("Added Book", data.title);

      toast.success("Book added successfully!", {
        description: `"${data.title}" has been added to the catalog.`,
      });

      form.reset();
      navigate("/admin/books");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to add book";
      toast.error("Failed to add book", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Get current admin user for activity log
  const getCurrentAdminId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData)?._id;
    }
    return null;
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
    localStorage.setItem(logKey, JSON.stringify(log.slice(0, 50)));
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold !text-heading mb-2">Add New Book</h1>
        <p className="text-base !text-muted-foreground">
          Add a book to the library catalog
        </p>
      </div>

      {/* Form Card */}
      <div className="!bg-white !border !border-gray-200 !rounded-lg p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Book Title
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        placeholder="Enter book title"
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

            {/* Author Field */}
            <FormField
              control={form.control}
              name="author"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Author Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        placeholder="Enter author name"
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

            {/* ISBN Field */}
            <FormField
              control={form.control}
              name="isbn"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    ISBN
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        placeholder="e.g. 978-3-16-148410-0"
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

            {/* Category Field */}
            <FormField
            className="!w-full"
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={`!h-12 !text-slate-900 !w-full ${
                        fieldState.error
                          ? "!border-red-600 !bg-red-50"
                          : "!border-slate-300"
                      }`}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="size-4 !text-slate-500" />
                          <SelectValue placeholder="Select a category" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-0">
                      {bookCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="!text-red-600" />
                </FormItem>
              )}
            />

            {/* Pages & Copies Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pages"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="!text-slate-700 !font-medium">
                      Pages
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                        <Input
                          type="number"
                          placeholder="e.g. 350"
                          className={`!pl-10 !h-12 !text-slate-900 placeholder:!text-slate-400 ${
                            fieldState.error
                              ? "!border-red-600 !bg-red-50 focus-visible:!border-red-600 focus-visible:!ring-red-600/50"
                              : "!border-slate-300"
                          }`}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="!text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalCopies"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="!text-slate-700 !font-medium">
                      Total Copies
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BookPlus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                        <Input
                          type="number"
                          placeholder="e.g. 5"
                          className={`!pl-10 !h-12 !text-slate-900 placeholder:!text-slate-400 ${
                            fieldState.error
                              ? "!border-red-600 !bg-red-50 focus-visible:!border-red-600 focus-visible:!ring-red-600/50"
                              : "!border-slate-300"
                          }`}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="!text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Cover Image URL Field */}
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Cover Image URL
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 size-4 !text-slate-500" />
                      <Input
                        placeholder="https://example.com/book-cover.jpg"
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

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="!text-slate-700 !font-medium">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <textarea
                      className={`flex min-h-[100px] w-full !rounded-md !border !bg-white px-3 py-2 text-sm !text-slate-900 placeholder:!text-slate-400 focus-visible:outline-none focus-visible:!ring-2 focus-visible:!ring-primary/50 ${
                        fieldState?.error
                          ? "!border-red-600 !bg-red-50"
                          : "!border-slate-300"
                      }`}
                      placeholder="Enter book description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="!text-red-600" />
                </FormItem>
              )}
            />

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
                  Adding Book...
                </>
              ) : (
                <>
                  <BookPlus className="size-4 mr-2" />
                  Add Book
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
