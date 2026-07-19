import { cn } from "@/lib/utils";

/** Shimmer-based skeleton primitives for loading states. */
function Bar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/60 to-muted",
        className,
      )}
    />
  );
}

export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Bar key={i} className="h-3 flex-1" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Bar key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 rounded-xl border border-border bg-card p-4", className)}>
      <Bar className="h-4 w-1/2" />
      <Bar className="h-3 w-3/4" />
      <Bar className="h-3 w-2/3" />
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="flex items-end gap-2 rounded-xl border border-border bg-card p-4"
      style={{ height }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Bar key={i} className="w-full" style={{ height: `${20 + Math.random() * 70}%` } as never} />
      ))}
    </div>
  );
}

export { Bar as Shimmer };
