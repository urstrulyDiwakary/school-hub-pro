import { PortalPage } from "@/components/portal/PortalPage";
import { CalendarView } from "@/components/portal/features/CalendarView";

export default function StudentCalendar() {
  return (
    <PortalPage title="Academic Calendar" description="Exams, events & holidays">
      <CalendarView />
    </PortalPage>
  );
}
