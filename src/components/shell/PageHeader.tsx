import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Enterprise page header primitive.
 * - Breadcrumb → title → description → actions
 * - Auto-derives breadcrumb from pathname when none provided
 * - Sticky-friendly, responsive, keyboard accessible
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  className,
}: PageHeaderProps) {
  const location = useLocation();
  const auto: Crumb[] = breadcrumbs ??
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        href: "/" + arr.slice(0, i + 1).join("/"),
      }));

  return (
    <header className={cn("mb-6 space-y-3 animate-fade-in", className)}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {auto.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            {c.href && i < auto.length - 1 ? (
              <Link
                to={c.href}
                className="rounded px-1 py-0.5 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {c.label}
              </Link>
            ) : (
              <span className="px-1 py-0.5 font-medium text-foreground">{c.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
        )}
      </div>
    </header>
  );
}
