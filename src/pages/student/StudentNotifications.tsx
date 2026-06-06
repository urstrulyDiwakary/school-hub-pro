import { PortalPage } from "@/components/portal/PortalPage";
import { NotificationsView } from "@/components/portal/features/NotificationsView";

export default function StudentNotifications() {
  return (
    <PortalPage title="Notifications" description="Messages, circulars & announcements">
      <NotificationsView audience="student" />
    </PortalPage>
  );
}
