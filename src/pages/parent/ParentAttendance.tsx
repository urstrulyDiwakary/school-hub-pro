import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { AttendanceView } from "@/components/portal/features/AttendanceView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function ParentAttendance() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Attendance" description="Daily history, analytics & absent alerts" actions={<ChildSwitcher />}>
      {student ? <AttendanceView studentId={student.id} /> : <p>No child linked.</p>}
    </PortalPage>
  );
}
