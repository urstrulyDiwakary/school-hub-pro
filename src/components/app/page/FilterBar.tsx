import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterBarProps {
  children?: ReactNode;
  active?: ActiveFilter[];
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({ children, active = [], onClearAll, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm",
        className,
      )}
    >
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-caption">Active:</span>
          {active.map((f) => (
            <Badge key={f.key} variant="secondary" className="gap-1 pl-2 pr-1">
              <span className="text-[11px] font-normal text-muted-foreground">{f.label}:</span>
              <span className="text-[11px] font-medium">{f.value}</span>
              <button
                type="button"
                onClick={f.onRemove}
                aria-label={`Remove filter ${f.label}`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-xs">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
