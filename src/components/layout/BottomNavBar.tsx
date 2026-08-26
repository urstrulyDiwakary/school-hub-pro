import { Link, useLocation } from "react-router-dom";
import { Megaphone, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { useAnnouncements } from "@/lib/announcementStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMobileNav, resolvePortalFromPath, portalTitles } from "@/lib/navigation";

export function BottomNavBar() {
  const location = useLocation();
  const portal = resolvePortalFromPath(location.pathname);
  const { primary, more } = getMobileNav(portal);
  const { user } = useAuthStore();
  const { unreadCount } = useAnnouncements(user?.role);

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {primary.map((item) => {
          const active = isActive(item.href!);
          return (
            <Link
              key={item.href}
              to={item.href!}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.title}</span>
              {active && <span className="h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}

        {/* Notices — always available, with live unread badge */}
        <Link
          to="/notices"
          aria-label={`Notices${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className={cn(
            "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
            isActive("/notices") ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="relative">
            <Megaphone className="h-5 w-5 shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-1 min-w-[15px] rounded-full bg-primary px-1 text-[9px] font-semibold leading-[15px] text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span className="truncate">Notices</span>
          {isActive("/notices") && <span className="h-1 w-1 rounded-full bg-primary" />}
        </Link>

        {more.length > 0 && (
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
                <SheetTitle>{portalTitles[portal]} menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 pb-2 pt-4">
                {more.map((item) => {
                  const active = isActive(item.href!);
                  return (
                    <Link
                      key={item.href}
                      to={item.href!}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-xs font-medium transition-colors",
                        active
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "text-foreground hover:bg-accent",
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
        )}
      </div>
    </nav>
  );
}
