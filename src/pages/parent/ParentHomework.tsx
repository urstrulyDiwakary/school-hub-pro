import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { HomeworkView } from "@/components/portal/features/HomeworkView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function ParentHomework() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Homework" description="Subject-wise homework, due dates & status" actions={<ChildSwitcher />}>
      {student ? <HomeworkView studentId={student.id} /> : <p>No child linked.</p>}
    </PortalPage>
  );
}
