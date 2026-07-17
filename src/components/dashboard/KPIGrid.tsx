import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatCardV2, type StatCardV2Props } from "./StatCardV2";

export interface KPIGridProps {
  items: StatCardV2Props[];
  className?: string;
  children?: ReactNode;
}

/**
 * Consistent responsive KPI grid for the top section of any dashboard.
 * Mobile: 2 cols · Tablet: 3 · Desktop: 4–6 cols (auto-fills).
 */
export function KPIGrid({ items, className, children }: KPIGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((it) => (
        <StatCardV2 key={it.label} {...it} size="sm" />
      ))}
      {children}
    </div>
  );
}
