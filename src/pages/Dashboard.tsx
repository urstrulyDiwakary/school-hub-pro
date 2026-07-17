import { lazy } from "react";
import {
  Calendar,
  CreditCard,
  GraduationCap,
  UserCheck,
  Users,
  Wallet,
  UserPlus,
  ClipboardCheck,
  FileText,
  Megaphone,
  BookOpen,
  Receipt,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  ActivityFeed,
  AlertCard,
  ApprovalQueue,
  CalendarWidget,
  ChartCard,
  DashboardGrid,
  DashboardShell,
  InsightCard,
  KPIGrid,
  NotificationPanel,
  QuickActionsPanel,
  TaskQueue,
  TrendCard,
  type ActivityItem,
  type ApprovalItem,
  type CalendarEvent,
  type DashboardAction,
  type DashboardAlert,
  type NotificationItem,
  type TaskItem,
} from "@/components/dashboard";
import { PageHeader } from "@/components/shell/PageHeader";

// Charts lazy-loaded so recharts is code-split out of the initial dashboard bundle.
const FeeCollectionChart = lazy(() =>
  import("@/components/dashboard/charts/AdminCharts").then((m) => ({ default: m.FeeCollectionChart })),
);
const StudentsByClassChart = lazy(() =>
  import("@/components/dashboard/charts/AdminCharts").then((m) => ({ default: m.StudentsByClassChart })),
);
const AttendanceTrendChart = lazy(() =>
  import("@/components/dashboard/charts/AdminCharts").then((m) => ({ default: m.AttendanceTrendChart })),
);
const GenderDistributionChart = lazy(() =>
  import("@/components/dashboard/charts/AdminCharts").then((m) => ({ default: m.GenderDistributionChart })),
);

// -------------------- Mock data (preserves original) --------------------

const feeCollectionData = [
  { month: "Apr", collected: 15.2, pending: 4.8 },
  { month: "May", collected: 16.8, pending: 3.2 },
  { month: "Jun", collected: 14.5, pending: 5.5 },
  { month: "Jul", collected: 18.2, pending: 2.8 },
  { month: "Aug", collected: 17.9, pending: 3.1 },
  { month: "Sep", collected: 19.5, pending: 2.5 },
  { month: "Oct", collected: 18.5, pending: 3.5 },
];

const studentsByClass = [
  { class: "1", students: 180 }, { class: "2", students: 195 }, { class: "3", students: 210 },
  { class: "4", students: 225 }, { class: "5", students: 240 }, { class: "6", students: 255 },
  { class: "7", students: 268 }, { class: "8", students: 285 }, { class: "9", students: 310 },
  { class: "10", students: 320 }, { class: "11", students: 180 }, { class: "12", students: 179 },
];

const attendanceTrend = [
  { day: "Mon", students: 96.2, staff: 98.5 },
  { day: "Tue", students: 95.8, staff: 97.2 },
  { day: "Wed", students: 94.5, staff: 96.8 },
  { day: "Thu", students: 93.2, staff: 95.5 },
  { day: "Fri", students: 91.8, staff: 94.2 },
  { day: "Sat", students: 88.5, staff: 92.1 },
];

const genderDistribution = [
  { name: "Boys", value: 1524, color: "hsl(234, 78%, 56%)" },
  { name: "Girls", value: 1323, color: "hsl(340, 82%, 52%)" },
];

const kpis = [
  { label: "Total Students", value: "2,847", icon: GraduationCap, tone: "primary" as const, change: "+12%", trend: "up" as const },
  { label: "Teaching Staff", value: "156", icon: Users, tone: "success" as const, change: "+3%", trend: "up" as const },
  { label: "Non-Teaching", value: "89", icon: UserCheck, tone: "info" as const, change: "0%", trend: "neutral" as const },
  { label: "Attendance", value: "94.2%", icon: Calendar, tone: "warning" as const, change: "-0.8%", trend: "down" as const },
  { label: "Fee Collection", value: "₹18.5L", icon: CreditCard, tone: "success" as const, change: "+8%", trend: "up" as const, hint: "This month" },
  { label: "Salary Expense", value: "₹12.3L", icon: Wallet, tone: "destructive" as const, change: "+2%", trend: "up" as const, hint: "This month" },
];

const quickActions: DashboardAction[] = [
  { id: "add-student", label: "Add Student", icon: UserPlus, to: "/students/add", tone: "primary", permission: "students:create", description: "Enrol new admission" },
  { id: "add-teacher", label: "Add Teacher", icon: Users, to: "/teachers/add", tone: "info", permission: "teachers:create", description: "Onboard staff" },
  { id: "mark-attendance", label: "Attendance", icon: ClipboardCheck, to: "/attendance", tone: "warning", permission: "attendance:mark", description: "Mark today" },
  { id: "collect-fees", label: "Collect Fees", icon: Receipt, to: "/fees", tone: "success", permission: "fees:collect", description: "Record payment" },
  { id: "announcement", label: "Announcement", icon: Megaphone, to: "/communication", tone: "primary", permission: "comm:send", description: "Broadcast notice" },
  { id: "reports", label: "Reports", icon: FileText, to: "/reports", tone: "info", permission: "reports:view", description: "View insights" },
  { id: "timetable", label: "Timetable", icon: BookOpen, to: "/timetable", tone: "default", permission: "timetable:view", description: "Weekly plan" },
  { id: "payroll", label: "Payroll", icon: Wallet, to: "/payroll", tone: "success", permission: "payroll:run", description: "Run payroll" },
];

const alerts: DashboardAlert[] = [
  { id: "a1", title: "Class 9-C attendance below 85%", description: "Today's attendance dropped to 82%. Review with class teacher.", tone: "warning", time: "1 hour ago", to: "/attendance", actionLabel: "Review" },
  { id: "a2", title: "24 fee reminders pending dispatch", description: "Overdue fees for Nov cycle need reminder SMS.", tone: "destructive", time: "3 hours ago", to: "/fees", actionLabel: "Send" },
  { id: "a3", title: "Report card deadline: Feb 10", description: "8 subjects still awaiting marks upload.", tone: "warning", time: "Today", to: "/exam/marks-entry", actionLabel: "Open" },
];

const approvals: ApprovalItem[] = [
  { id: "ap1", title: "Leave request — 2 days (Sick)", requester: "Rajesh Kumar", meta: "Mathematics", time: "2h ago" },
  { id: "ap2", title: "Fee waiver — ₹8,000", requester: "Sneha Patel · Class 8-B", meta: "Financial hardship", time: "Yesterday" },
  { id: "ap3", title: "Exam re-evaluation", requester: "Arjun Kumar · Class 10-A", meta: "Mid-term Physics", time: "Yesterday" },
];

const activities: ActivityItem[] = [
  { id: "1", title: "New admission", description: "Arjun Kumar enrolled in Class 6-A", time: "10 min ago", icon: UserPlus, tone: "primary" },
  { id: "2", title: "Fee payment received", description: "Sneha Patel paid ₹25,000 · Class 8-B", time: "25 min ago", icon: Receipt, tone: "success" },
  { id: "3", title: "Attendance alert", description: "Class 9-C at 82% today", time: "1 hour ago", icon: AlertTriangle, tone: "warning" },
  { id: "4", title: "Leave approved", description: "Rajesh Kumar · 2 days sick leave", time: "2 hours ago", icon: ClipboardCheck, tone: "info" },
  { id: "5", title: "Exam scheduled", description: "Mid-term exams · Nov 15–25", time: "3 hours ago", icon: FileText, tone: "primary" },
];

const tasks: TaskItem[] = [
  { id: "t1", title: "Approve November payroll", meta: "156 teachers · ₹12.3L", due: "Today", tone: "warning" },
  { id: "t2", title: "Review Class 10 report cards", meta: "42 pending signatures", due: "Feb 8", tone: "primary" },
  { id: "t3", title: "Sign vendor invoices", meta: "5 invoices · ₹1.8L", due: "Feb 10", tone: "info" },
  { id: "t4", title: "Publish exam timetable", meta: "Mid-term · All classes", due: "Feb 12" },
];

const events: CalendarEvent[] = [
  { id: "e1", date: new Date(Date.now() + 86400000).toISOString(), title: "Staff meeting", meta: "10:00 AM · Conference room", tone: "primary" },
  { id: "e2", date: new Date(Date.now() + 3 * 86400000).toISOString(), title: "Parent-teacher meet", meta: "Classes 6–8", tone: "info" },
  { id: "e3", date: new Date(Date.now() + 8 * 86400000).toISOString(), title: "Mid-term exams begin", meta: "Classes 9 & 10", tone: "warning" },
  { id: "e4", date: new Date(Date.now() + 15 * 86400000).toISOString(), title: "Annual sports day", meta: "Whole school", tone: "success" },
];

const notifications: NotificationItem[] = [
  { id: "n1", title: "New fee policy circulated", message: "Late fee waiver extended till Feb 20.", time: "1h", unread: true, tone: "primary" },
  { id: "n2", title: "Board inspection scheduled", message: "CBSE affiliation review on Feb 18.", time: "4h", unread: true, tone: "warning" },
  { id: "n3", title: "Payroll processed", message: "October salaries disbursed successfully.", time: "Yesterday", tone: "success" },
];

// -------------------- Command Center --------------------

export default function Dashboard() {
  return (
    <DashboardShell
      header={
        <PageHeader
          title="Command Center"
          description="What's happening today, what needs attention, and what to do next."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        />
      }
      top={
        <div className="space-y-4">
          <KPIGrid items={kpis} />
          <DashboardGrid>
            <QuickActionsPanel actions={quickActions} columns={4} size="lg" />
            <AlertCard alerts={alerts} size="lg" />
          </DashboardGrid>
        </div>
      }
      middle={
        <DashboardGrid>
          <TrendCard
            label="Fees this month"
            value="₹18.5L"
            change="+8%"
            trend="up"
            tone="success"
            icon={CreditCard}
            data={feeCollectionData.map((d) => ({ x: d.month, y: d.collected }))}
            size="sm"
          />
          <TrendCard
            label="Avg attendance"
            value="94.2%"
            change="-0.8%"
            trend="down"
            tone="warning"
            icon={Calendar}
            data={attendanceTrend.map((d) => ({ x: d.day, y: d.students }))}
            size="sm"
          />
          <TrendCard
            label="New admissions"
            value="42"
            change="+12"
            trend="up"
            tone="primary"
            icon={GraduationCap}
            data={[{ x: 1, y: 6 }, { x: 2, y: 8 }, { x: 3, y: 5 }, { x: 4, y: 9 }, { x: 5, y: 7 }, { x: 6, y: 12 }, { x: 7, y: 15 }]}
            size="sm"
          />
          <TrendCard
            label="Pending approvals"
            value={approvals.length}
            change="3 new"
            tone="destructive"
            icon={AlertTriangle}
            data={[{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 5 }, { x: 5, y: 3 }, { x: 6, y: 4 }]}
            size="sm"
          />

          <ChartCard
            title="Fee collection trend"
            description="Collected vs pending (₹ lakhs)"
            size="xl"
            chart={<FeeCollectionChart data={feeCollectionData} />}
          />
          <ChartCard
            title="Students by class"
            description="Distribution across grades"
            size="md"
            chart={<StudentsByClassChart data={studentsByClass} />}
          />
          <ChartCard
            title="Weekly attendance"
            description="Students vs staff"
            size="xl"
            chart={<AttendanceTrendChart data={attendanceTrend} />}
          />
          <ChartCard
            title="Gender ratio"
            description={`${genderDistribution[0].value + genderDistribution[1].value} students`}
            size="md"
            chart={<GenderDistributionChart data={genderDistribution} />}
          />

          <InsightCard
            title="Attendance dipping on Saturdays"
            message="Student attendance drops 6% on Saturdays. Consider engagement activities to close the gap."
            tone="info"
            size="lg"
            icon={TrendingUp}
            action={{ label: "See attendance report", to: "/reports" }}
          />
          <InsightCard
            title="Fee collection ahead of target"
            message="You're ₹1.2L above forecast for November. Great work."
            tone="success"
            size="lg"
            icon={TrendingUp}
          />
        </DashboardGrid>
      }
      bottom={
        <DashboardGrid>
          <ApprovalQueue items={approvals} size="lg" />
          <TaskQueue tasks={tasks} size="md" />
          <ActivityFeed items={activities} size="md" />
          <CalendarWidget events={events} size="md" />
          <NotificationPanel items={notifications} size="lg" viewAllHref="/communication" />
        </DashboardGrid>
      }
    />
  );
}
