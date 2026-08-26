import { useState } from "react";
import { Bell, Menu, User, LogOut, Settings as SettingsIcon, Plus, HelpCircle, ChevronDown, Building2, CalendarRange } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/types";
import { CommandPaletteTrigger } from "@/components/shell/CommandPalette";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { useAnnouncements, type Announcement } from "@/lib/announcementStore";
import { AnnouncementDetailDialog } from "@/components/announcements/AnnouncementDetailDialog";
import { categoryMeta, formatWhen } from "@/components/announcements/meta";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items, unreadCount, isRead, markRead, markAllRead } = useAnnouncements(user?.role);
  const [activeNotice, setActiveNotice] = useState<Announcement | null>(null);

  const openNotice = (a: Announcement) => {
    markRead(a.id);
    setActiveNotice(a);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-card/80 px-3 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global search — ⌘K */}
      <div className="hidden flex-1 md:flex md:max-w-md">
        <CommandPaletteTrigger />
      </div>
      <div className="flex-1 md:hidden" />

      {/* Contextual switchers */}
      <div className="hidden items-center gap-1 lg:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Main Campus
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Switch campus</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Main Campus</DropdownMenuItem>
            <DropdownMenuItem>North Wing</DropdownMenuItem>
            <DropdownMenuItem>Junior Block</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-xs font-medium">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              AY 2024-25
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Academic year</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>2024-25 (Active)</DropdownMenuItem>
            <DropdownMenuItem>2023-24</DropdownMenuItem>
            <DropdownMenuItem>2022-23</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-0.5">
        {/* Quick actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Quick actions" className="hidden sm:inline-flex">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">Create</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/students/add")}>Add Student</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/teachers/add")}>Add Teacher</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/staff/add")}>Add Staff</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/exams/configuration")}>New Exam</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/communication")}>Announcement</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications — live announcement feed */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-[18px] text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {unreadCount} unread
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No announcements yet.
              </p>
            ) : (
              items.slice(0, 6).map((a) => {
                const Meta = categoryMeta[a.category];
                const unread = !isRead(a.id);
                return (
                  <DropdownMenuItem
                    key={a.id}
                    onSelect={() => openNotice(a)}
                    className={cn("flex items-start gap-2 py-3", unread && "bg-primary/[0.04]")}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        Meta.chip,
                      )}
                      aria-hidden="true"
                    >
                      <Meta.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.title}</span>
                      <span className="block line-clamp-2 text-xs text-muted-foreground">
                        {a.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {formatWhen(a.createdAt)}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between gap-2 px-1 py-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/notices")}>
                View all
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <AnnouncementDetailDialog
          announcement={activeNotice}
          open={!!activeNotice}
          onOpenChange={(o) => !o && setActiveNotice(null)}
        />

        {/* Help */}
        <Button variant="ghost" size="icon" aria-label="Help & docs" className="hidden sm:inline-flex">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        {/* User profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-1 h-9 gap-2 px-1.5" aria-label="User menu">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-semibold text-primary-foreground shadow-sm">
                {user?.initials ?? "U"}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-medium leading-tight text-foreground">
                  {user?.name ?? "Guest"}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : ""}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
