import { PortalPage } from "@/components/portal/PortalPage";
import { NotificationsView } from "@/components/portal/features/NotificationsView";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { useAuthStore } from "@/lib/auth";

export default function StudentNotifications() {
  const user = useAuthStore((s) => s.user);
  return (
    <PortalPage title="Notifications" description="Notices, circulars & announcements">
      {user?.live ? (
        <AnnouncementFeed title="School notices" maxHeight={520} />
      ) : (
        <NotificationsView audience="student" />
      )}
    </PortalPage>
  );
}
