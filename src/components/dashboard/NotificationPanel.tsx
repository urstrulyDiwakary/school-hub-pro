import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toneClasses } from "./tone";
import type { NotificationItem, WidgetSize } from "./types";

export interface NotificationPanelProps {
  title?: string;
  items: NotificationItem[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  viewAllHref?: string;
  emptyLabel?: string;
}

export function NotificationPanel({
  title = "Notifications",
  items,
  size = "md",
  loading,
  onRefresh,
  viewAllHref,
  emptyLabel = "You're all caught up.",
}: NotificationPanelProps) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <WidgetCard
      title={title}
      icon={<Bell className="h-4 w-4" />}
      size={size}
      loading={loading}
      onRefresh={onRefresh}
      isEmpty={!loading && items.length === 0}
      emptyState={<p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>}
      actions={
        <>
          {unread > 0 && (
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              {unread}
            </Badge>
          )}
          {viewAllHref && (
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
              <Link to={viewAllHref}>View all</Link>
            </Button>
          )}
        </>
      }
    >
      <ul className="divide-y">
        {items.map((n) => {
          const c = toneClasses(n.tone ?? "primary");
          return (
            <li key={n.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  n.unread ? c.text.replace("text-", "bg-") : "bg-muted-foreground/30",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-tight", n.unread ? "font-semibold" : "font-medium")}>
                  {n.title}
                </p>
                {n.message && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
