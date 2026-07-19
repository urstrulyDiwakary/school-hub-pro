import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "fullscreen";

const sizeMap: Record<Size, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  fullscreen: "sm:max-w-full sm:w-screen",
};

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: Size;
  side?: "left" | "right";
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Standardized side drawer used across the app for previews, quick edits,
 * and detail views. Prefer this over navigating to a new page for
 * transactional / preview workflows.
 */
export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  side = "right",
  footer,
  children,
}: AppDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex w-full flex-col p-0", sizeMap[size])}>
        {(title || description) && (
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
