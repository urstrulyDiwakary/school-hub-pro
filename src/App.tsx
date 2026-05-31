import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import Staff from "./pages/Staff";
import AddStaff from "./pages/AddStaff";
import Fees from "./pages/Fees";
import FeeStructure from "./pages/FeeStructure";
import Payroll from "./pages/Payroll";
import PayrollAudit from "./pages/PayrollAudit";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherHomework from "./pages/TeacherHomework";
import TeacherMarks from "./pages/TeacherMarks";
import TeacherRemarks from "./pages/TeacherRemarks";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherAttendanceHistory from "./pages/TeacherAttendanceHistory";
import TeacherPayslip from "./pages/TeacherPayslip";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ExportPermissions from "./pages/ExportPermissions";
import ExportConfig from "./pages/ExportConfig";
import ExportAuditLog from "./pages/ExportAuditLog";
import ExportTemplates from "./pages/ExportTemplates";
import NotFound from "./pages/NotFound";
import ExportJobsPanel from "./components/exports/ExportJobsPanel";
import { exportJobQueue } from "./lib/exportJobQueue";

// Restore any persisted failed-job history once at module load so the panel
// shows previous failures (with timestamps + error reasons) after a reload.
if (typeof window !== "undefined") {
  exportJobQueue.restoreFromStorage();
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ExportJobsPanel />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with dashboard layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Students */}
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/students/attendance" element={<Attendance />} />
            
            {/* Teachers */}
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/add" element={<AddTeacher />} />
            
            {/* Non-Teaching Staff */}
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/add" element={<AddStaff />} />
            
            {/* Fees */}
            <Route path="/fees" element={<Fees />} />
            <Route path="/fees/structure" element={<FeeStructure />} />
            <Route path="/fees/pending" element={<Fees />} />
            
            {/* Payroll */}
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payroll/process" element={<Payroll />} />
            <Route path="/payroll/audit" element={<PayrollAudit />} />
            
            {/* Academics */}
            <Route path="/academics/classes" element={<Classes />} />
            <Route path="/academics/subjects" element={<Subjects />} />
            <Route path="/academics/timetable" element={<Timetable />} />
            
            {/* Attendance */}
            <Route path="/attendance" element={<Attendance />} />
            
            {/* Communication */}
            <Route path="/communication" element={<Communication />} />
            
            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/export-permissions" element={<ExportPermissions />} />
            <Route path="/settings/export-config" element={<ExportConfig />} />
            <Route path="/settings/export-templates" element={<ExportTemplates />} />
            <Route path="/settings/export-audit" element={<ExportAuditLog />} />

            {/* Teacher Panel */}
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/homework" element={<TeacherHomework />} />
            <Route path="/teacher/marks" element={<TeacherMarks />} />
            <Route path="/teacher/remarks" element={<TeacherRemarks />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/attendance/history" element={<TeacherAttendanceHistory />} />
            <Route path="/teacher/payslip" element={<TeacherPayslip />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
