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
import Teachers from "./pages/Teachers";
import Fees from "./pages/Fees";
import Attendance from "./pages/Attendance";
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
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/attendance" element={<Attendance />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/add" element={<AddStudent />} />
            <Route path="/staff" element={<Students />} />
            <Route path="/staff/add" element={<AddStudent />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/fees/structure" element={<Fees />} />
            <Route path="/fees/pending" element={<Fees />} />
            <Route path="/payroll" element={<Fees />} />
            <Route path="/payroll/process" element={<Fees />} />
            <Route path="/academics/classes" element={<Students />} />
            <Route path="/academics/subjects" element={<Students />} />
            <Route path="/academics/timetable" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/communication" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
