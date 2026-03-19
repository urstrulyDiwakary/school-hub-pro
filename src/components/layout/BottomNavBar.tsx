import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Students", icon: Users, href: "/students" },
  { title: "Teacher", icon: GraduationCap, href: "/teacher" },
  { title: "Fees", icon: CreditCard, href: "/fees" },
  { title: "Reports", icon: BarChart3, href: "/reports" },
];

export function BottomNavBar() {
  const location = useLocation();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-w-0",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active && "text-primary"
                )}
              />
              <span className="truncate">{item.title}</span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
