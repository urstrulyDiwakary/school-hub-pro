import { PortalPage } from "@/components/portal/PortalPage";
import { HomeworkView } from "@/components/portal/features/HomeworkView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentAssignments() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Assignments" description="Submission status & grades">
      {student && <HomeworkView studentId={student.id} />}
    </PortalPage>
  );
}
