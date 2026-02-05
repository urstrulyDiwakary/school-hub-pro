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
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherHomework from "./pages/TeacherHomework";
import TeacherMarks from "./pages/TeacherMarks";
import TeacherRemarks from "./pages/TeacherRemarks";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            
            {/* Teacher Panel */}
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/homework" element={<TeacherHomework />} />
            <Route path="/teacher/marks" element={<TeacherMarks />} />
            <Route path="/teacher/remarks" element={<TeacherRemarks />} />
            <Route path="/teacher/attendance" element={<Attendance />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
