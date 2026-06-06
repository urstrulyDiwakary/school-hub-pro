import { PortalPage } from "@/components/portal/PortalPage";
import { HomeworkView } from "@/components/portal/features/HomeworkView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentHomework() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Homework" description="Subject-wise homework & due dates">
      {student && <HomeworkView studentId={student.id} />}
    </PortalPage>
  );
}
