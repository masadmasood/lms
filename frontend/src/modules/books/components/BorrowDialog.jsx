import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  User,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Info,
} from "lucide-react";
import { borrowFormSchema, borrowFormDefaults } from "../schemas/borrowFormSchema";
import { useBorrowBook } from "../hooks/useBorrowBook";
import { getUser } from "@/shared/utils/auth";
import { toast } from "sonner";

/**
 * BorrowDialog Component - Multi-step dialog for borrowing books
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {Object} props.book - Selected book to borrow
 */
export function BorrowDialog({ open, onOpenChange, book }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  // React Hook Form with Zod Validation
  const form = useForm({
    resolver: zodResolver(borrowFormSchema),
    defaultValues: borrowFormDefaults,
  });

  // Borrow mutation hook
  const borrowMutation = useBorrowBook({
    onSuccess: () => {
      onOpenChange(false);
      navigate("/dashboard/borrowed-books");
    },
  });

  // Pre-fill form with user data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const user = getUser();
      if (user) {
        form.reset({
          borrowerName: user.username || "",
          email: user.email || "",
          borrowDuration: 7,
        });
      }
    }
  }, [open, form]);

  // Reset dialog state when opened/closed
  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setCurrentStep(1);
      setShowFullDescription(false);
      form.reset(borrowFormDefaults);
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleBorrowConfirm = (data) => {
    if (!book) return;

    // Get userId from localStorage
    const user = getUser();
    if (!user || !user._id) {
      toast.error("User not found. Please login again.");
      return;
    }

    borrowMutation.mutate({
      userId: user._id,
      bookId: book.bookId,
      email: data.email,
      borrowerName: user.username || data.borrowerName, // Send actual username
      borrowDuration: data.borrowDuration, // Optional, if backend needs it
    });
  };

  // Calculate due date based on borrow duration
  const calculateDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today);
    const duration = form.watch("borrowDuration") || 7;
    dueDate.setDate(today.getDate() + duration);
    return dueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-4rem)] lg:max-w-4xl w-full gap-0 border-border rounded-lg overflow-y-auto bg-white shadow-none border-0 p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-[350px_1fr]">
            {/* Left Side - Full Image */}
            <div className="relative w-full h-full overflow-hidden border-0">
              {!imageLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full bg-gray-100" />
              )}
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className={`w-full md:h-full h-100 object-cover transition-opacity duration-300 border-0 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Back Button - Top Left */}
              {currentStep === 2 && (
                <div className="absolute top-3 left-3 z-20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    disabled={borrowMutation.isPending}
                    className="rounded-full size-8 bg-white/90 border border-gray-200 hover:bg-primary text-black hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Book Title and Author - Bottom Left */}
              <div className="absolute bottom-4 left-4 z-10 text-white">
                <h3 className="text-lg font-bold leading-tight drop-shadow-lg text-white mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-white/80 drop-shadow-md">
                  by {book.author}
                </p>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="flex flex-col p-6 space-y-5">
              {currentStep === 1 ? (
                <BookDetailsStep
                  book={book}
                  showFullDescription={showFullDescription}
                  onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                  onNext={() => setCurrentStep(2)}
                />
              ) : (
                <BorrowFormStep
                  form={form}
                  onSubmit={handleBorrowConfirm}
                  isSubmitting={borrowMutation.isPending}
                  calculateDueDate={calculateDueDate}
                />
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * BookDetailsStep - Step 1: Display book details
 */
function BookDetailsStep({ book, showFullDescription, onToggleDescription, onNext }) {
  return (
    <>
      {/* Title */}
      <div>
        <h3 className="text-3xl font-bold text-heading leading-tight">
          {book.title}
        </h3>
      </div>

      {/* Author with Icon */}
      <div className="flex items-center gap-2.5 text-base text-muted-foreground">
        <User className="w-5 h-5 text-primary" />
        <span className="font-medium">{book.author}</span>
      </div>

      {/* Pages and Available Copies */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground py-3 border-y border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-medium">{book.pages} pages</span>
        </div>
        <span className="text-border">•</span>
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              book.availableCopies > 0 ? "text-success" : "text-error"
            }`}
          >
            {book.availableCopies} Available
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-base font-semibold text-heading capitalize">
          Description
        </h4>
        <p
          className={`text-sm text-muted-foreground leading-relaxed ${
            !showFullDescription ? "line-clamp-5" : ""
          }`}
        >
          {book.description || "No description available for this book."}
        </p>
        {book.description && book.description.length > 200 && (
          <Button
            variant="link"
            size="sm"
            onClick={onToggleDescription}
            className="px-0 h-auto text-primary font-normal cursor-pointer hover:underline"
          >
            {showFullDescription ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto">
        <Button
          onClick={onNext}
          className="px-6! h-10 gap-2 bg-primary hover:bg-primary-hover"
        >
          Next <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}

/**
 * BorrowFormStep - Step 2: Borrow form
 */
function BorrowFormStep({ form, onSubmit, isSubmitting, calculateDueDate }) {
  return (
    <>
      {/* Form Header */}
      <div className="pb-2">
        <h3 className="text-2xl font-bold text-heading leading-tight">
          Borrow Request Form
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details to complete your borrow request
        </p>
      </div>

      {/* Form with Zod Validation */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Borrower Name */}
          <FormField
            control={form.control}
            name="borrowerName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full Name *"
                    {...field}
                    className={`h-11 text-slate-900 placeholder:text-slate-400 ${
                      fieldState.error
                        ? "border-red-600 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/50"
                        : "border-border focus-visible:ring-ring"
                    }`}
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-xs" />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address *"
                    {...field}
                    className={`h-11 text-slate-900 placeholder:text-slate-400 ${
                      fieldState.error
                        ? "border-red-600 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/50"
                        : "border-border focus-visible:ring-ring"
                    }`}
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-xs" />
              </FormItem>
            )}
          />

          {/* Borrow Duration and Due Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Borrow Duration */}
            <FormField
              control={form.control}
              name="borrowDuration"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="14"
                      placeholder="Borrow Duration (Days)"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 7)
                      }
                      className={`h-11 text-slate-900 placeholder:text-slate-400 ${
                        fieldState.error
                          ? "border-red-600 bg-red-50 focus-visible:border-red-600 focus-visible:ring-red-600/50"
                          : "border-border focus-visible:ring-ring"
                      }`}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Maximum 14 days</p>
                  <FormMessage className="text-red-600 text-xs" />
                </FormItem>
              )}
            />

            {/* Due Date - Readonly */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Due Date (Auto-calculated)"
                value={calculateDueDate()}
                readOnly
                className="h-11 border-border bg-muted cursor-not-allowed text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-xs text-muted-foreground">
                Auto-calculated based on duration
              </p>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-heading">
                  Important Borrowing Policy
                </h4>
                <p className="text-xs text-body leading-relaxed">
                  Books can be borrowed for up to 14 days and must be returned
                  in good condition. Late returns may incur penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 mt-auto">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 h-11 bg-primary hover:bg-primary-hover"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default BorrowDialog;

