import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { cn } from "@/lib/utils";
import { toneClasses } from "./tone";
import type { DashboardAction, WidgetSize } from "./types";

export interface QuickActionsPanelProps {
  title?: string;
  actions: DashboardAction[];
  /** Permission checker — receives action.permission and returns true when allowed. */
  can?: (permission?: string) => boolean;
  size?: WidgetSize;
  columns?: 2 | 3 | 4;
}

/**
 * Reusable quick actions grid. Actions are data-driven and can later
 * be permission-filtered via the `can` prop (RBAC-aware).
 */
export function QuickActionsPanel({
  title = "Quick actions",
  actions,
  can,
  size = "md",
  columns = 4,
}: QuickActionsPanelProps) {
  const visible = actions.filter((a) => (can ? can(a.permission) : true));

  const grid = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <WidgetCard
      title={title}
      icon={<Zap className="h-4 w-4" />}
      size={size}
      isEmpty={visible.length === 0}
      emptyState={<p className="py-3 text-center text-xs text-muted-foreground">No actions available.</p>}
    >
      <div className={cn("grid gap-2", grid)}>
        {visible.map((a) => {
          const c = toneClasses(a.tone ?? "primary");
          const Icon = a.icon;
          const inner = (
            <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-border/70 bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm">
              {Icon && (
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", c.bg, c.text)}>
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.label}</p>
                {a.description && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{a.description}</p>
                )}
              </div>
            </div>
          );
          if (a.to) {
            return (
              <Link key={a.id} to={a.to} className="focus-ring rounded-lg">
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={a.id}
              type="button"
              onClick={a.onClick}
              className="focus-ring rounded-lg"
            >
              {inner}
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}
