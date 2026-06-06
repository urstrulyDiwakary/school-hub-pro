// Centralized, role-aware navigation config for EduTrack Pro.
// Drives both the desktop sidebar and the mobile bottom navigation.

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Wallet,
  CreditCard,
  BookOpen,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  ClipboardCheck,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  FileText,
  User,
  Receipt,
  CheckSquare,
  Trophy,
  Clock,
  PlaneTakeoff,
} from "lucide-react";

export type Portal = "admin" | "teacher" | "parent" | "student";

export interface NavChild {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavChild[];
}

export const navByPortal: Record<Portal, NavItem[]> = {
  admin: [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {
      title: "Teacher Panel",
      icon: GraduationCap,
      children: [
        { title: "My Dashboard", href: "/teacher" },
        { title: "Homework", href: "/teacher/homework" },
        { title: "Marks Entry", href: "/teacher/marks" },
        { title: "Student Remarks", href: "/teacher/remarks" },
        { title: "Attendance", href: "/teacher/attendance" },
        { title: "Attendance History", href: "/teacher/attendance/history" },
        { title: "My Payslip", href: "/teacher/payslip" },
      ],
    },
    {
      title: "Students",
      icon: Users,
      children: [
        { title: "All Students", href: "/students" },
        { title: "Add Student", href: "/students/add" },
        { title: "Attendance", href: "/students/attendance" },
      ],
    },
    {
      title: "Teachers",
      icon: GraduationCap,
      children: [
        { title: "All Teachers", href: "/teachers" },
        { title: "Add Teacher", href: "/teachers/add" },
      ],
    },
    {
      title: "Staff",
      icon: UserCheck,
      children: [
        { title: "All Staff", href: "/staff" },
        { title: "Add Staff", href: "/staff/add" },
      ],
    },
    {
      title: "Fees",
      icon: CreditCard,
      children: [
        { title: "Fee Collection", href: "/fees" },
        { title: "Fee Structure", href: "/fees/structure" },
        { title: "Pending Fees", href: "/fees/pending" },
      ],
    },
    {
      title: "Payroll",
      icon: Wallet,
      children: [
        { title: "Salary Structure", href: "/payroll" },
        { title: "Process Payroll", href: "/payroll/process" },
        { title: "Audit Report", href: "/payroll/audit" },
      ],
    },
    {
      title: "Academics",
      icon: BookOpen,
      children: [
        { title: "Classes", href: "/academics/classes" },
        { title: "Subjects", href: "/academics/subjects" },
        { title: "Timetable", href: "/academics/timetable" },
      ],
    },
    { title: "Attendance", icon: Calendar, href: "/attendance" },
    { title: "Communication", icon: Bell, href: "/communication" },
    { title: "Reports", icon: BarChart3, href: "/reports" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ],

  teacher: [
    { title: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
    { title: "Homework", icon: BookOpen, href: "/teacher/homework" },
    { title: "Marks Entry", icon: ClipboardCheck, href: "/teacher/marks" },
    { title: "Student Remarks", icon: MessageSquare, href: "/teacher/remarks" },
    { title: "Attendance", icon: CalendarCheck, href: "/teacher/attendance" },
    { title: "Attendance History", icon: Clock, href: "/teacher/attendance/history" },
    { title: "My Payslip", icon: Wallet, href: "/teacher/payslip" },
  ],

  parent: [
    { title: "Dashboard", icon: LayoutDashboard, href: "/parent/dashboard" },
    { title: "Child Profile", icon: User, href: "/parent/child" },
    { title: "Attendance", icon: CalendarCheck, href: "/parent/attendance" },
    { title: "Fees", icon: CreditCard, href: "/parent/fees" },
    { title: "Homework", icon: BookOpen, href: "/parent/homework" },
    { title: "Exam Results", icon: Trophy, href: "/parent/results" },
    { title: "Communication", icon: MessageSquare, href: "/parent/communication" },
    { title: "Leave Requests", icon: PlaneTakeoff, href: "/parent/leave" },
  ],

  student: [
    { title: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
    { title: "Attendance", icon: CalendarCheck, href: "/student/attendance" },
    { title: "Timetable", icon: Clock, href: "/student/timetable" },
    { title: "Homework", icon: BookOpen, href: "/student/homework" },
    { title: "Assignments", icon: CheckSquare, href: "/student/assignments" },
    { title: "Exam Results", icon: Trophy, href: "/student/results" },
    { title: "Fee Status", icon: Receipt, href: "/student/fees" },
    { title: "Notifications", icon: Bell, href: "/student/notifications" },
    { title: "Calendar", icon: CalendarDays, href: "/student/calendar" },
    { title: "Profile", icon: User, href: "/student/profile" },
  ],
};

/** Bottom-nav primary tabs (first 4) per portal; the rest go in "More". */
export function getMobileNav(portal: Portal): { primary: NavItem[]; more: NavItem[] } {
  // Flatten admin children to top-level for mobile.
  const flat: NavItem[] =
    portal === "admin"
      ? [
          { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { title: "Students", icon: Users, href: "/students" },
          { title: "Teachers", icon: GraduationCap, href: "/teachers" },
          { title: "Fees", icon: CreditCard, href: "/fees" },
          { title: "Reports", icon: BarChart3, href: "/reports" },
          { title: "Attendance", icon: CalendarCheck, href: "/attendance" },
          { title: "Classes", icon: BookOpen, href: "/academics/classes" },
          { title: "Payroll", icon: Wallet, href: "/payroll" },
          { title: "Communication", icon: MessageSquare, href: "/communication" },
          { title: "Settings", icon: Settings, href: "/settings" },
        ]
      : navByPortal[portal].filter((i) => i.href);
  return { primary: flat.slice(0, 4), more: flat.slice(4) };
}

/** Resolve the active portal from the current pathname. */
export function resolvePortalFromPath(pathname: string): Portal {
  if (pathname === "/parent" || pathname.startsWith("/parent/")) return "parent";
  if (pathname === "/student" || pathname.startsWith("/student/")) return "student";
  if (pathname === "/teacher" || pathname.startsWith("/teacher/")) return "teacher";
  return "admin";
}

export const portalTitles: Record<Portal, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};
