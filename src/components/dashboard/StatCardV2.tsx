import { TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { toneClasses } from "./tone";
import type { Tone, TrendDirection, WidgetSize } from "./types";
import { cn } from "@/lib/utils";

export interface StatCardV2Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  size?: WidgetSize;
  change?: string;
  trend?: TrendDirection;
  loading?: boolean;
  onClick?: () => void;
  bare?: boolean;
}

/**
 * Enterprise KPI card. Focused (icon + value + delta) with tight visual hierarchy.
 */
export function StatCardV2({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  size = "sm",
  change,
  trend = "neutral",
  loading,
  onClick,
}: StatCardV2Props) {
  const c = toneClasses(tone);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <WidgetCard size={size} loading={loading} className={onClick ? "cursor-pointer" : ""}>
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
        }}
        className="flex h-full flex-col justify-between gap-3"
      >
        <div className="flex items-start justify-between">
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                c.bg,
                c.text,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          {change && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {change}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold leading-tight tracking-tight">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>}
        </div>
      </div>
    </WidgetCard>
  );
}
