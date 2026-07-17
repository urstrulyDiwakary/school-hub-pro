import { Check, X } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApprovalItem, WidgetSize } from "./types";

export interface ApprovalQueueProps {
  title?: string;
  items: ApprovalItem[];
  size?: WidgetSize;
  loading?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
}

export function ApprovalQueue({
  title = "Awaiting your approval",
  items,
  size = "lg",
  loading,
  onRefresh,
  emptyLabel = "No pending approvals.",
}: ApprovalQueueProps) {
  return (
    <WidgetCard
      title={title}
      size={size}
      loading={loading}
      onRefresh={onRefresh}
      isEmpty={!loading && items.length === 0}
      emptyState={<p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>}
      actions={
        items.length > 0 ? (
          <Badge variant="secondary" className="border-0 bg-warning/10 text-warning">
            {items.length}
          </Badge>
        ) : null
      }
    >
      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{it.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {it.requester}
                {it.meta && ` · ${it.meta}`}
                {it.time && ` · ${it.time}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => it.onReject?.(it.id)}
                aria-label="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-success hover:bg-success/10"
                onClick={() => it.onApprove?.(it.id)}
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
