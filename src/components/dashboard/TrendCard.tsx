import { lazy, Suspense } from "react";
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { toneClasses } from "./tone";
import type { SparkPoint, Tone, TrendDirection, WidgetSize } from "./types";
import { cn } from "@/lib/utils";

const Sparkline = lazy(() => import("./Sparkline"));

export interface TrendCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: TrendDirection;
  data?: SparkPoint[];
  icon?: LucideIcon;
  tone?: Tone;
  size?: WidgetSize;
  hint?: string;
  loading?: boolean;
}

export function TrendCard({
  label,
  value,
  change,
  trend = "neutral",
  data,
  icon: Icon,
  tone = "primary",
  size = "sm",
  hint,
  loading,
}: TrendCardProps) {
  const c = toneClasses(tone);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <WidgetCard size={size} loading={loading}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", c.bg, c.text)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
          </div>
          {change && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {change}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold leading-tight tracking-tight">{value}</p>
          {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {data && data.length > 0 && (
          <div className="mt-auto h-10">
            <Suspense fallback={<div className="h-full w-full animate-pulse rounded bg-muted/50" />}>
              <Sparkline data={data} tone={tone} />
            </Suspense>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
