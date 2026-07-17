import { forwardRef, type ReactNode } from "react";
import { AlertCircle, Loader2, Maximize2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { widgetColSpan } from "./tone";
import type { WidgetSize } from "./types";

export interface WidgetCardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  size?: WidgetSize;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  onRefresh?: () => void;
  onExpand?: () => void;
  className?: string;
  bodyClassName?: string;
  /** Skip the outer grid col-span wrapper (when composing manually). */
  bare?: boolean;
}

/**
 * Base widget primitive. All dashboard cards should extend this
 * to inherit loading / empty / error / refresh / expand handling.
 */
export const WidgetCard = forwardRef<HTMLDivElement, WidgetCardProps>(
  function WidgetCard(
    {
      title,
      description,
      icon,
      actions,
      footer,
      children,
      size = "md",
      loading,
      error,
      isEmpty,
      emptyState,
      onRefresh,
      onExpand,
      className,
      bodyClassName,
      bare,
    },
    ref,
  ) {
    const showHeader = title || description || icon || actions || onRefresh || onExpand;

    const body = (
      <Card
        ref={ref}
        className={cn(
          "flex h-full flex-col overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md",
          className,
        )}
      >
        {showHeader && (
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                {title && (
                  <CardTitle className="truncate text-sm font-semibold tracking-tight">
                    {title}
                  </CardTitle>
                )}
              </div>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {actions}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onRefresh}
                  aria-label="Refresh widget"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              {onExpand && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onExpand}
                  aria-label="Expand widget"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn("flex-1", bodyClassName)}>
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Something went wrong</span>
              </div>
              <p className="text-xs opacity-80">{error}</p>
              {onRefresh && (
                <Button size="sm" variant="outline" onClick={onRefresh}>
                  Retry
                </Button>
              )}
            </div>
          ) : isEmpty ? (
            emptyState ?? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing to show yet.
              </p>
            )
          ) : (
            children
          )}
        </CardContent>
        {footer && <div className="border-t bg-muted/30 px-6 py-3 text-xs">{footer}</div>}
      </Card>
    );

    if (bare) return body;
    return <div className={widgetColSpan(size)}>{body}</div>;
  },
);
