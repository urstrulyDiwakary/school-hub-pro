import type { LucideIcon } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { toneClasses } from "./tone";
import type { Tone, WidgetSize } from "./types";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

export interface InsightCardProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  tone?: Tone;
  size?: WidgetSize;
  action?: { label: string; onClick?: () => void; to?: string };
}

export function InsightCard({
  title,
  message,
  icon: Icon = Lightbulb,
  tone = "info",
  size = "md",
  action,
}: InsightCardProps) {
  const c = toneClasses(tone);
  return (
    <WidgetCard size={size} bodyClassName="pt-0">
      <div className={cn("flex gap-3 rounded-lg p-3", c.bg)}>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background", c.text)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={cn("mt-2 text-xs font-medium underline-offset-2 hover:underline", c.text)}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
