import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { PageHeader } from "@/components/shell/PageHeader";

/** Full-page announcement feed — holidays, alerts, events & notices. */
export default function Notices() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notices & Alerts"
        description="Holidays, alerts, events and circulars broadcast by management and teachers"
      />
      <AnnouncementFeed title="All announcements" maxHeight={640} />
    </div>
  );
}
