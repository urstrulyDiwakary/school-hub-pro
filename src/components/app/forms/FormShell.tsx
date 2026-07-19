import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface FormShellProps {
  title?: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Consistent form shell — header, sections, and a sticky footer. */
export function FormShell({ title, description, onSubmit, footer, children, className }: FormShellProps) {
  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-h-section">{title}</h2>}
          {description && <p className="mt-1 text-caption">{description}</p>}
        </div>
      )}
      <div className="space-y-6">{children}</div>
      {footer && (
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
          {footer}
        </div>
      )}
    </form>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function FormSection({ title, description, collapsible, defaultOpen = true, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header
        className={cn(
          "flex items-center justify-between px-4 py-3 sm:px-6",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={() => collapsible && setOpen((o) => !o)}
      >
        <div>
          <h3 className="text-h-card">{title}</h3>
          {description && <p className="mt-0.5 text-caption">{description}</p>}
        </div>
        {collapsible && (
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        )}
      </header>
      {open && <div className="border-t border-border p-4 sm:p-6">{children}</div>}
    </section>
  );
}

interface FormStepperProps {
  steps: { key: string; label: string }[];
  current: string;
  onStepClick?: (key: string) => void;
}

export function FormStepper({ steps, current, onStepClick }: FormStepperProps) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
        return (
          <li key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick?.(s.key)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                state === "done" && "border-primary bg-primary text-primary-foreground",
                state === "current" && "border-primary text-primary",
                state === "todo" && "border-border text-muted-foreground",
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              {i + 1}
            </button>
            <span className={cn("text-sm", state === "current" ? "font-medium" : "text-muted-foreground")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
