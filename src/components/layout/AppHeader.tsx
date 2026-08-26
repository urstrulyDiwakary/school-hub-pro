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

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-[10px] font-normal text-muted-foreground">2 unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Annual Sports Day</p>
              <p className="text-xs text-muted-foreground">Participation forms due by 12 Jun</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">PTM Scheduled</p>
              <p className="text-xs text-muted-foreground">Parent-Teacher Meeting on 14 Jun</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
