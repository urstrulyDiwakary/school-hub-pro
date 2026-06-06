import { PortalPage } from "@/components/portal/PortalPage";
import { FeesView } from "@/components/portal/features/FeesView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentFees() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Fee Status" description="Breakdown, dues & receipts">
      {student && <FeesView studentId={student.id} studentName={student.name} readOnly />}
    </PortalPage>
  );
}
