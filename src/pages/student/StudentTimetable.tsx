import { PortalPage } from "@/components/portal/PortalPage";
import { TimetableView } from "@/components/portal/features/TimetableView";

export default function StudentTimetable() {
  return (
    <PortalPage title="Timetable" description="Weekly class schedule">
      <TimetableView />
    </PortalPage>
  );
}
