import { WidgetCard } from "./WidgetCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toneClasses } from "./tone";
import type { TaskItem, WidgetSize } from "./types";

export interface TaskQueueProps {
  title?: string;
  tasks: TaskItem[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
}

export function TaskQueue({
  title = "Your tasks",
  tasks,
  size = "md",
  loading,
  onRefresh,
  emptyLabel = "You're all caught up.",
}: TaskQueueProps) {
  const pending = tasks.filter((t) => !t.done).length;
  return (
    <WidgetCard
      title={title}
      size={size}
      loading={loading}
      onRefresh={onRefresh}
      isEmpty={!loading && tasks.length === 0}
      emptyState={<p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>}
      actions={
        pending > 0 ? (
          <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
            {pending}
          </Badge>
        ) : null
      }
    >
      <ul className="space-y-2">
        {tasks.map((t) => {
          const c = toneClasses(t.tone ?? "default");
          return (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/40"
            >
              <Checkbox
                checked={t.done}
                onCheckedChange={() => t.onToggle?.(t.id)}
                aria-label={t.title}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    t.done && "text-muted-foreground line-through",
                  )}
                >
                  {t.title}
                </p>
                {t.meta && <p className="mt-0.5 text-xs text-muted-foreground">{t.meta}</p>}
              </div>
              {t.due && (
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", c.text)}>
                  {t.due}
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
