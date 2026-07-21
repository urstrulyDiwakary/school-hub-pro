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
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
// Parent Portal
import ParentDashboard from "./pages/parent/ParentDashboard";
import ChildProfile from "./pages/parent/ChildProfile";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentFees from "./pages/parent/ParentFees";
import ParentHomework from "./pages/parent/ParentHomework";
import ParentResults from "./pages/parent/ParentResults";
import ParentCommunication from "./pages/parent/ParentCommunication";
import ParentLeave from "./pages/parent/ParentLeave";
// Student Portal
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentHomework from "./pages/student/StudentHomework";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentResults from "./pages/student/StudentResults";
import StudentFees from "./pages/student/StudentFees";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentCalendar from "./pages/student/StudentCalendar";
import StudentPortalProfile from "./pages/student/StudentProfile";
import ExportJobsPanel from "./components/exports/ExportJobsPanel";
import { exportJobQueue } from "./lib/exportJobQueue";
// Examination & Assessment module
import ExamDashboard from "./pages/exam/ExamDashboard";
import ExamConfiguration from "./pages/exam/ExamConfiguration";
import ExamTimetable from "./pages/exam/ExamTimetable";
import MarksEntry from "./pages/exam/MarksEntry";
import GradeSystem from "./pages/exam/GradeSystem";
import ReportCards from "./pages/exam/ReportCards";
import ResultPublishing from "./pages/exam/ResultPublishing";
import ExamAnalytics from "./pages/exam/ExamAnalytics";
import QuestionBank from "./pages/exam/QuestionBank";
import HallTickets from "./pages/exam/HallTickets";
import EvaluationCenter from "./pages/exam/EvaluationCenter";
import ExamReports from "./pages/exam/ExamReports";

// Restore any persisted failed-job history once at module load so the panel
// shows previous failures (with timestamps + error reasons) after a reload.
if (typeof window !== "undefined") {
  exportJobQueue.restoreFromStorage();
}

const queryClient = new QueryClient();

import { ThemeProvider } from "./components/theme/ThemeProvider";
import { CommandPalette } from "./components/shell/CommandPalette";
import { PlatformProvider } from "./platform";

const App = () => (
  <ThemeProvider>
    <PlatformProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ExportJobsPanel />
          <CommandPalette />
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes — guarded by role-based permission matrix */}
          <Route element={<ProtectedRoute />}>
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

              {/* Examination & Assessment */}
              <Route path="/exams" element={<ExamDashboard />} />
              <Route path="/exams/dashboard" element={<ExamDashboard />} />
              <Route path="/exams/configuration" element={<ExamConfiguration />} />
              <Route path="/exams/timetable" element={<ExamTimetable />} />
              <Route path="/exams/marks" element={<MarksEntry />} />
              <Route path="/exams/grades" element={<GradeSystem />} />
              <Route path="/exams/report-cards" element={<ReportCards />} />
              <Route path="/exams/publishing" element={<ResultPublishing />} />
              <Route path="/exams/analytics" element={<ExamAnalytics />} />
              <Route path="/exams/question-bank" element={<QuestionBank />} />
              <Route path="/exams/hall-tickets" element={<HallTickets />} />
              <Route path="/exams/evaluation" element={<EvaluationCenter />} />
              <Route path="/exams/reports" element={<ExamReports />} />

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

              {/* Parent Portal */}
              <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/child" element={<ChildProfile />} />
              <Route path="/parent/attendance" element={<ParentAttendance />} />
              <Route path="/parent/fees" element={<ParentFees />} />
              <Route path="/parent/homework" element={<ParentHomework />} />
              <Route path="/parent/results" element={<ParentResults />} />
              <Route path="/parent/communication" element={<ParentCommunication />} />
              <Route path="/parent/leave" element={<ParentLeave />} />

              {/* Student Portal */}
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/timetable" element={<StudentTimetable />} />
              <Route path="/student/homework" element={<StudentHomework />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/fees" element={<StudentFees />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
              <Route path="/student/calendar" element={<StudentCalendar />} />
              <Route path="/student/profile" element={<StudentPortalProfile />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </PlatformProvider>
  </ThemeProvider>
);

export default App;
