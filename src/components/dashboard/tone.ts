import { cn } from "@/lib/utils";
import type { Tone } from "./types";

export const toneText: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export const toneBgSoft: Record<Tone, string> = {
  default: "bg-muted",
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
  info: "bg-info/10",
};

export const toneBorder: Record<Tone, string> = {
  default: "border-border",
  primary: "border-primary/30",
  success: "border-success/30",
  warning: "border-warning/30",
  destructive: "border-destructive/30",
  info: "border-info/30",
};

export const toneRing: Record<Tone, string> = {
  default: "ring-border",
  primary: "ring-primary/20",
  success: "ring-success/20",
  warning: "ring-warning/20",
  destructive: "ring-destructive/20",
  info: "ring-info/20",
};

export function toneClasses(t: Tone = "default") {
  return {
    text: toneText[t],
    bg: toneBgSoft[t],
    border: toneBorder[t],
    ring: toneRing[t],
  };
}

/**
 * Widget size → grid column classes.
 * Grid is 12 cols on lg+, 6 on md, 1 on base.
 */
export function widgetColSpan(size: "sm" | "md" | "lg" | "xl" | "full" = "md") {
  return cn(
    "col-span-1",
    {
      sm: "md:col-span-2 lg:col-span-3",
      md: "md:col-span-3 lg:col-span-4",
      lg: "md:col-span-6 lg:col-span-6",
      xl: "md:col-span-6 lg:col-span-8",
      full: "md:col-span-6 lg:col-span-12",
    }[size],
  );
}
