import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Horizontal toolbar for list pages — search on the left, actions on the right.
 * Wraps gracefully on narrow viewports.
 */
export function Toolbar({ left, right, children, className }: ToolbarProps) {
  if (children) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm",
          className,
        )}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}
