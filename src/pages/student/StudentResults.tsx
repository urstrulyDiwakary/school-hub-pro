import { PortalPage } from "@/components/portal/PortalPage";
import { ResultsView } from "@/components/portal/features/ResultsView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentResults() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Exam Results" description="Marks, percentage, rank & progress">
      {student && <ResultsView studentId={student.id} />}
    </PortalPage>
  );
}
