import { LayoutDashboard, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyDashboardStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyDashboardState({
  title = "Your dashboard is quiet",
  description = "Once activity starts flowing in, you'll see live insights, tasks, and alerts here.",
  icon: Icon = LayoutDashboard,
  actionLabel,
  onAction,
}: EmptyDashboardStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
