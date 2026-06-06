import { PortalPage } from "@/components/portal/PortalPage";
import { AttendanceView } from "@/components/portal/features/AttendanceView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentAttendance() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="My Attendance" description="History & analytics">
      {student && <AttendanceView studentId={student.id} />}
    </PortalPage>
  );
}
