import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { ResultsView } from "@/components/portal/features/ResultsView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function ParentResults() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Exam Results" description="Marks, percentage, rank & progress" actions={<ChildSwitcher />}>
      {student ? <ResultsView studentId={student.id} /> : <p>No child linked.</p>}
    </PortalPage>
  );
}
