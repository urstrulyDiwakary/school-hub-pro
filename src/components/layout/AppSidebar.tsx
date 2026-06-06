import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, ChevronDown, ChevronRight, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navByPortal, resolvePortalFromPath, portalTitles } from "@/lib/navigation";
import { useAuthStore } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/types";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const portal = resolvePortalFromPath(location.pathname);
  const navItems = navByPortal[portal];

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Keep the group containing the active route expanded.
  useEffect(() => {
    const open = navItems.filter((i) => isChildActive(i.children)).map((i) => i.title);
    if (open.length) setExpandedItems((prev) => Array.from(new Set([...prev, ...open])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, portal]);

  const toggleExpanded = (title: string) =>
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.initials ?? "SA";
  const roleLabel = user ? ROLE_LABELS[user.role] : `${portalTitles[portal]} Panel`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-sidebar transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-primary">EduTrack Pro</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={onToggle}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      aria-expanded={expandedItems.includes(item.title)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isChildActive(item.children)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedItems.includes(item.title) && (
                      <ul className="mt-1 space-y-1 pl-11">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              to={child.href}
                              onClick={onToggle}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-primary text-primary-foreground"
                                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                              )}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href!}
                    onClick={onToggle}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href!)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-primary">
                {user?.name ?? "Guest"}
              </p>
              <p className="truncate text-xs text-sidebar-muted">{roleLabel}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
