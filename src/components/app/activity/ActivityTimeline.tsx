import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/app/feedback/EmptyState";

export interface ActivityEvent {
  id: string;
  time: string | Date;
  user: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  device?: string;
  ip?: string;
  category?: string;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  pageSize?: number;
  className?: string;
}

export function ActivityTimeline({ events, pageSize = 20, className }: ActivityTimelineProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.oldValue?.toLowerCase().includes(q) ||
        e.newValue?.toLowerCase().includes(q),
    );
  }, [events, query]);

  const paged = filtered.slice(0, page * pageSize);

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        placeholder="Search activity by user, action, value…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />
      {paged.length === 0 ? (
        <EmptyState title="No activity" description="Nothing has been recorded yet." />
      ) : (
        <ol className="space-y-3">
          {paged.map((e) => (
            <li
              key={e.id}
              className="relative flex gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
            >
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{e.user}</span>
                  <span className="text-muted-foreground">{e.action}</span>
                  {e.category && <Badge variant="secondary">{e.category}</Badge>}
                </div>
                {(e.oldValue || e.newValue) && (
                  <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    {e.oldValue && <code className="rounded bg-muted px-1.5 py-0.5">{e.oldValue}</code>}
                    <span>→</span>
                    {e.newValue && <code className="rounded bg-muted px-1.5 py-0.5">{e.newValue}</code>}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span title={new Date(e.time).toLocaleString()}>
                    {formatDistanceToNow(new Date(e.time), { addSuffix: true })}
                  </span>
                  {e.device && <span>{e.device}</span>}
                  {e.ip && <span className="font-mono">{e.ip}</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      {paged.length < filtered.length && (
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className="w-full rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted/40"
        >
          Load more
        </button>
      )}
    </div>
  );
}
