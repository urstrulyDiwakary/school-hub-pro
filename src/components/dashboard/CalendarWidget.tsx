import { WidgetCard } from "./WidgetCard";
import { cn } from "@/lib/utils";
import { toneClasses } from "./tone";
import type { CalendarEvent, WidgetSize } from "./types";
import { Calendar as CalendarIcon } from "lucide-react";

export interface CalendarWidgetProps {
  title?: string;
  events: CalendarEvent[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
}

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
  };
}

export function CalendarWidget({
  title = "Upcoming events",
  events,
  size = "md",
  loading,
  onRefresh,
  emptyLabel = "No upcoming events.",
}: CalendarWidgetProps) {
  return (
    <WidgetCard
      title={title}
      icon={<CalendarIcon className="h-4 w-4" />}
      size={size}
      loading={loading}
      onRefresh={onRefresh}
      isEmpty={!loading && events.length === 0}
      emptyState={<p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>}
    >
      <ul className="space-y-2">
        {events.map((e) => {
          const f = fmt(e.date);
          const c = toneClasses(e.tone ?? "primary");
          return (
            <li key={e.id} className="flex items-center gap-3 rounded-md border p-2.5">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md",
                  c.bg,
                  c.text,
                )}
              >
                <span className="text-xs font-medium uppercase">{f.month}</span>
                <span className="text-sm font-bold leading-none">{f.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {f.weekday}
                  {e.meta && ` · ${e.meta}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}

export { CalendarWidget as UpcomingEventsCard };
