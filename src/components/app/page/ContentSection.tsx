import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function ContentSection({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: ContentSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-h-section">{title}</h2>}
            {description && <p className="mt-0.5 text-caption">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && "p-4 sm:p-6")}>{children}</div>
    </section>
  );
}
