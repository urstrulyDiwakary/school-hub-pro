import { Activity } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { toneClasses } from "./tone";
import { cn } from "@/lib/utils";
import type { ActivityItem, WidgetSize } from "./types";

export interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
  maxItems?: number;
}

export function ActivityFeed({
  title = "Recent activity",
  items,
  size = "md",
  loading,
  onRefresh,
  emptyLabel = "No recent activity.",
  maxItems,
}: ActivityFeedProps) {
  const list = maxItems ? items.slice(0, maxItems) : items;
  return (
    <WidgetCard
      title={title}
      size={size}
      loading={loading}
      onRefresh={onRefresh}
      isEmpty={!loading && list.length === 0}
      emptyState={<p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>}
    >
      <ol className="relative space-y-3 pl-4 before:absolute before:left-[9px] before:top-1 before:bottom-1 before:w-px before:bg-border">
        {list.map((it) => {
          const c = toneClasses(it.tone ?? "primary");
          const Icon = it.icon ?? Activity;
          return (
            <li key={it.id} className="relative">
              <span
                className={cn(
                  "absolute -left-4 top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background",
                  c.bg,
                  c.text,
                )}
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{it.title}</p>
                  {it.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{it.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">{it.time}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </WidgetCard>
  );
}
