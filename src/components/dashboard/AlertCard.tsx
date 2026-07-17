import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { WidgetCard } from "./WidgetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toneClasses } from "./tone";
import type { DashboardAlert, WidgetSize } from "./types";

const toneIcon = {
  default: Info,
  primary: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
} as const;

export interface AlertCardProps {
  title?: string;
  description?: string;
  alerts: DashboardAlert[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
}

export function AlertCard({
  title = "Critical alerts",
  description,
  alerts,
  size = "lg",
  loading,
  onRefresh,
  emptyLabel = "All systems normal.",
}: AlertCardProps) {
  return (
    <WidgetCard
      title={title}
      description={description}
      size={size}
      loading={loading}
      isEmpty={!loading && alerts.length === 0}
      emptyState={
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {emptyLabel}
        </div>
      }
      onRefresh={onRefresh}
      actions={
        alerts.length > 0 ? (
          <Badge variant="secondary" className="border-0 bg-destructive/10 text-destructive">
            {alerts.length}
          </Badge>
        ) : null
      }
    >
      <ul className="divide-y">
        {alerts.map((a) => {
          const tone = a.tone ?? "warning";
          const c = toneClasses(tone);
          const Icon = toneIcon[tone] ?? AlertTriangle;
          return (
            <li key={a.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", c.bg, c.text)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{a.title}</p>
                {a.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
                )}
                {a.time && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{a.time}</p>}
              </div>
              {(a.actionLabel || a.to) && (
                <Button asChild={!!a.to} variant="ghost" size="sm" className="h-7 shrink-0 text-xs" onClick={a.onAction}>
                  {a.to ? <Link to={a.to}>{a.actionLabel ?? "View"}</Link> : <span>{a.actionLabel}</span>}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
