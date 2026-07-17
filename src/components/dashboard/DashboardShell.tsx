import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardShellProps {
  header?: ReactNode;
  top?: ReactNode;
  middle?: ReactNode;
  bottom?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Consistent vertical structure every portal dashboard should use:
 *   Top    → KPIs, quick actions, critical alerts
 *   Middle → analytics, charts, module-specific insights
 *   Bottom → activity, tasks, calendar, notifications
 */
export function DashboardShell({
  header,
  top,
  middle,
  bottom,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      {header}
      {top && <section aria-label="Overview">{top}</section>}
      {middle && <section aria-label="Analytics">{middle}</section>}
      {bottom && <section aria-label="Activity">{bottom}</section>}
      {children}
    </div>
  );
}

/**
 * Responsive 12-column dashboard grid.
 *  - base:  1 col (mobile stacked, no horizontal scroll)
 *  - md:    6 cols (tablet)
 *  - lg+:   12 cols (desktop)
 * Children should be WidgetCard instances that set their own col-span
 * via the `size` prop.
 */
export function DashboardGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
