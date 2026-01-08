import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Search,
  UserPlus,
  Users,
  Mail,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { adminService } from "../services/adminService";

/**
 * View Students Page - List all students with delete functionality
 */
export default function ViewStudents() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students from API
  const {
    data: students = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: adminService.getAllStudents,
    staleTime: 30000, // 30 seconds
  });

  // Get current admin user for activity log
  const getCurrentAdminId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData)?._id;
    }
    return null;
  };

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: adminService.deleteStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully!", {
        description: `${selectedStudent?.username} has been removed. An email notification has been sent.`,
      });
      setDeleteDialogOpen(false);
      setSelectedStudent(null);

      // Update activity log (admin-specific)
      addToActivityLog("Deleted Student", selectedStudent?.username);
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.message || "Failed to delete student";
      toast.error("Failed to delete student", { description: errorMsg });
    },
  });

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
    });
    localStorage.setItem(logKey, JSON.stringify(log.slice(0, 50)));
  };

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete click
  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (selectedStudent?._id) {
      deleteStudentMutation.mutate(selectedStudent._id);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-red-500">Failed to load students</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["students"] })
          }
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold !text-heading mb-1">
            View Students
          </h1>
          <p className="text-base !text-muted-foreground">
            Manage all student accounts
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/add-student")}
          className="!h-11"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 !text-slate-400" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!pl-10 !h-12 !border-slate-300"
        />
      </div>

      {/* Students Table */}
      <div className="!bg-white !border !border-gray-200 !rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading students...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="!bg-slate-50 !border-b !border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  Added Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold !text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y !divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student._id || index}
                    className="hover:!bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm !text-slate-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 !bg-primary/10 !rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 !text-primary" />
                        </div>
                        <span className="font-medium !text-slate-800">
                          {student.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 !text-slate-600">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm !text-slate-600">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium !bg-success/10 !text-success !rounded-full">
                        Student
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!text-red-500 hover:!text-red-700 hover:!bg-red-50"
                        onClick={() => handleDeleteClick(student)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 !text-gray-300" />
                      <p className="!text-slate-500">No students found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/admin/add-student")}
                        className="!h-10"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add First Student
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Total Students:{" "}
        <span className="font-semibold text-heading">
          {filteredStudents.length}
        </span>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm bg-white border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Student
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone. An email notification will be sent to the student.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="py-4 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedStudent.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteStudentMutation.isPending}
              className={"h-10 border border-gray-300 text-gray-500 font-normal px-6 hover:border-primary hover:bg-primary/5 hover:text-primary"}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmDelete}
              disabled={deleteStudentMutation.isPending}
              className={"h-10 bg-red-600 hover:bg-red-700 "}
            >
              {deleteStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 " />
                  Delete Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
