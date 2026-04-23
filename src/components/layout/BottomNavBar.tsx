import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  CalendarCheck,
  Wallet,
  Settings as SettingsIcon,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { detectRoleFromPath, type UserRole } from "@/lib/userRole";

type Role = UserRole;

const adminPrimary: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Students", icon: Users, href: "/students" },
  { title: "Teachers", icon: GraduationCap, href: "/teachers" },
  { title: "Fees", icon: CreditCard, href: "/fees" },
];

const adminMore: NavItem[] = [
  { title: "Reports", icon: BarChart3, href: "/reports" },
  { title: "Attendance", icon: CalendarCheck, href: "/attendance" },
  { title: "Classes", icon: BookOpen, href: "/academics/classes" },
  { title: "Payroll", icon: Wallet, href: "/payroll" },
  { title: "Communication", icon: MessageSquare, href: "/communication" },
  { title: "Settings", icon: SettingsIcon, href: "/settings" },
];

const teacherPrimary: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
  { title: "Attendance", icon: CalendarCheck, href: "/teacher/attendance" },
  { title: "Homework", icon: BookOpen, href: "/teacher/homework" },
  { title: "Marks", icon: ClipboardCheck, href: "/teacher/marks" },
];

const teacherMore: NavItem[] = [
  { title: "Remarks", icon: MessageSquare, href: "/teacher/remarks" },
  { title: "History", icon: CalendarCheck, href: "/teacher/attendance/history" },
  { title: "Payslip", icon: Wallet, href: "/teacher/payslip" },
  { title: "Settings", icon: SettingsIcon, href: "/settings" },
];

export function BottomNavBar() {
  const location = useLocation();
  const role = detectRole(location.pathname);

  const primary = role === "teacher" ? teacherPrimary : adminPrimary;
  const more = role === "teacher" ? teacherMore : adminMore;

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {primary.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.title}</span>
              {active && <span className="h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="More navigation options"
            >
              <MoreHorizontal className="h-5 w-5 shrink-0" />
              <span className="truncate">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>{role === "teacher" ? "Teacher menu" : "Admin menu"}</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 pt-4 pb-2">
              {more.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-xs font-medium transition-colors",
                      active
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-center leading-tight">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
