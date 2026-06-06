import { PortalPage } from "@/components/portal/PortalPage";
import { NotificationsView } from "@/components/portal/features/NotificationsView";

export default function ParentCommunication() {
  return (
    <PortalPage title="Communication" description="Messages, circulars & announcements from school">
      <NotificationsView audience="parent" />
    </PortalPage>
  );
}
