import { lazy, Suspense, type ReactNode } from "react";
import { WidgetCard, type WidgetCardProps } from "./WidgetCard";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartCardProps extends Omit<WidgetCardProps, "children"> {
  /** Provide chart as a lazy import so it code-splits automatically. */
  chart: ReactNode;
  height?: number;
}

/**
 * Wrapper for chart widgets. Charts should be lazy-loaded by the caller
 * via React.lazy so recharts stays out of the initial dashboard bundle.
 */
export function ChartCard({ chart, height = 260, ...rest }: ChartCardProps) {
  return (
    <WidgetCard size="lg" {...rest}>
      <div style={{ height }} className="w-full">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>{chart}</Suspense>
      </div>
    </WidgetCard>
  );
}

export { lazy };
