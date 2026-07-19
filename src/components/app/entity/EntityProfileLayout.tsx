import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface EntityTab {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface EntityProfileLayoutProps {
  summary: ReactNode;
  actions?: ReactNode;
  tabs: EntityTab[];
  defaultTab?: string;
  className?: string;
}

/**
 * Shared layout for any entity profile (student, teacher, staff, parent,
 * invoice, payroll record). Consumers supply the summary header, action
 * bar, and tab content — layout, spacing, and behavior stay identical.
 */
export function EntityProfileLayout({
  summary,
  actions,
  tabs,
  defaultTab,
  className,
}: EntityProfileLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">{summary}</div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </section>
      <Tabs defaultValue={defaultTab ?? tabs[0]?.key} className="space-y-4">
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-0">
            {t.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
