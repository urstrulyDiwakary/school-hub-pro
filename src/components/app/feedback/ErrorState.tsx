import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, LifeBuoy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  supportHref?: string;
  technicalDetails?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  supportHref,
  technicalDetails,
  className,
}: ErrorStateProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-h-section">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        )}
        {supportHref && (
          <Button size="sm" variant="outline" asChild>
            <a href={supportHref}>
              <LifeBuoy className="mr-2 h-4 w-4" /> Contact support
            </a>
          </Button>
        )}
      </div>
      {technicalDetails && (
        <div className="mt-4 w-full max-w-lg text-left">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
            Technical details
          </button>
          {open && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-background p-2 text-[11px]">
              {technicalDetails}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
