import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, ChevronDown, ChevronRight, LogOut, X, Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navByPortal, resolvePortalFromPath, portalTitles, type NavItem } from "@/lib/navigation";
import { useAuthStore } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/types";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Logical grouping for the admin portal (all others stay flat).
const ADMIN_SECTIONS: { label: string; items: string[] }[] = [
  { label: "Overview", items: ["Dashboard"] },
  { label: "People", items: ["Students", "Teachers", "Staff", "Teacher Panel"] },
  { label: "Academics", items: ["Academics", "Examinations", "Attendance"] },
  { label: "Finance", items: ["Fees", "Payroll"] },
  { label: "Operations", items: ["Communication", "Reports", "Settings"] },
];

const FAV_KEY = "edutrack.sidebar.favorites";

function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const toggle = (href: string) => {
    setFavs((cur) => {
      const next = cur.includes(href) ? cur.filter((h) => h !== href) : [...cur, href];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };
  return { favs, toggle };
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const portal = resolvePortalFromPath(location.pathname, user?.role);
  const navItems = navByPortal[portal];
  const { favs, toggle: toggleFav } = useFavorites();

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  // Build ordered sections for rendering
  const sections = useMemo(() => {
    if (portal !== "admin") return [{ label: "", items: navItems }];
    const map = new Map(navItems.map((n) => [n.title, n]));
    const used = new Set<string>();
    const built = ADMIN_SECTIONS.map((s) => ({
      label: s.label,
      items: s.items.map((t) => map.get(t)).filter(Boolean) as NavItem[],
    })).filter((s) => s.items.length > 0);
    built.forEach((s) => s.items.forEach((i) => used.add(i.title)));
    const leftover = navItems.filter((n) => !used.has(n.title));
    if (leftover.length) built.push({ label: "More", items: leftover });
    return built;
  }, [portal, navItems]);

  // Flatten favorite entries against nav (top-level or child)
  const favEntries = useMemo(() => {
    const flat: { title: string; href: string; icon: NavItem["icon"] }[] = [];
    for (const item of navItems) {
      if (item.href) flat.push({ title: item.title, href: item.href, icon: item.icon });
      if (item.children)
        for (const c of item.children) flat.push({ title: c.title, href: c.href, icon: item.icon });
    }
    return flat.filter((e) => favs.includes(e.href)).slice(0, 6);
  }, [favs, navItems]);

  const renderItem = (item: NavItem) => {
    if (item.children) {
      const expanded = expandedItems.includes(item.title);
      const active = isChildActive(item.children);
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            aria-expanded={expanded}
            className={cn(
              "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.title}</span>
            </div>
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-70" />
            )}
          </button>
          {expanded && (
            <ul className="mt-1 space-y-0.5 border-l border-sidebar-border/60 pl-3 ml-4">
              {item.children.map((child) => {
                const activeChild = isActive(child.href);
                const isFav = favs.includes(child.href);
                return (
                  <li key={child.href} className="group/child flex items-center gap-1">
                    <Link
                      to={child.href}
                      onClick={onToggle}
                      className={cn(
                        "flex-1 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                        activeChild
                          ? "bg-primary/15 font-medium text-sidebar-primary"
                          : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {child.title}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFav(child.href);
                      }}
                      aria-label={isFav ? "Unpin" : "Pin"}
                      className={cn(
                        "shrink-0 rounded p-1 text-sidebar-muted opacity-0 transition-opacity hover:text-sidebar-primary group-hover/child:opacity-100 focus:opacity-100",
                        isFav && "text-warning opacity-100",
                      )}
                    >
                      {isFav ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    const active = isActive(item.href!);
    const isFav = favs.includes(item.href!);
    return (
      <div key={item.title} className="group/item flex items-center gap-1">
        <Link
          to={item.href!}
          onClick={onToggle}
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary/15 text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon className="h-[18px] w-[18px]" />
          <span>{item.title}</span>
          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
        </Link>
        <button
          onClick={() => toggleFav(item.href!)}
          aria-label={isFav ? "Unpin" : "Pin"}
          className={cn(
            "shrink-0 rounded p-1 text-sidebar-muted opacity-0 transition-opacity hover:text-sidebar-primary group-hover/item:opacity-100 focus:opacity-100",
            isFav && "text-warning opacity-100",
          )}
        >
          {isFav ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
        </button>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border/70 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/30">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold text-sidebar-primary">EduTrack Pro</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-sidebar-muted">
                {portalTitles[portal]} · AY 24-25
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={onToggle}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {favEntries.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
                Pinned
              </p>
              <ul className="space-y-0.5">
                {favEntries.map((e) => {
                  const active = isActive(e.href);
                  return (
                    <li key={e.href}>
                      <Link
                        to={e.href}
                        onClick={onToggle}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                          active
                            ? "bg-primary/15 font-medium text-sidebar-primary"
                            : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <e.icon className="h-4 w-4" />
                        <span className="truncate">{e.title}</span>
                        <Star className="ml-auto h-3 w-3 fill-current text-warning" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {sections.map((section, idx) => (
            <div key={section.label || idx} className={cn(idx > 0 && "mt-4")}>
              {section.label && (
                <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border/70 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/40 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-primary">
                {user?.name ?? "Guest"}
              </p>
              <p className="truncate text-[11px] text-sidebar-muted">{roleLabel}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
