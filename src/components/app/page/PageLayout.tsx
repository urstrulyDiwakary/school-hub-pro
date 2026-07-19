import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader, type Crumb } from "@/components/shell/PageHeader";

interface PageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  icon?: ReactNode;
  toolbar?: ReactNode;
  stats?: ReactNode;
  filters?: ReactNode;
  stickyActions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Enterprise page shell — composes header, stats row, filters, toolbar,
 * content, and an optional sticky action bar. All pages should adopt this
 * to guarantee identical spacing, breadcrumbs, and responsive behavior.
 */
export function PageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  toolbar,
  stats,
  filters,
  stickyActions,
  className,
  children,
}: PageLayoutProps) {
  return (
    <div className={cn("flex min-h-full flex-col", className)}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
        icon={icon}
      />
      {stats && <div className="mb-6">{stats}</div>}
      {filters && <div className="mb-4">{filters}</div>}
      {toolbar && <div className="mb-4">{toolbar}</div>}
      <div className="flex-1 space-y-6">{children}</div>
      {stickyActions && (
        <div className="sticky bottom-0 left-0 right-0 z-30 mt-6 -mx-4 border-t border-border bg-background/90 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-end gap-2">{stickyActions}</div>
        </div>
      )}
    </div>
  );
}
