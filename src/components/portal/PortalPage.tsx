import { ReactNode } from "react";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";

interface PortalPageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Consistent page shell used across the parent & student portals. */
export function PortalPage({ title, description, actions, children }: PortalPageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* No-ops when the app shell already renders the ticker above. */}
      <AnnouncementBanner className="-mx-4 -mt-4 lg:-mx-6 lg:-mt-6" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
