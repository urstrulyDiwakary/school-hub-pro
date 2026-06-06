import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { FeesView } from "@/components/portal/features/FeesView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function ParentFees() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Fees" description="Breakdown, payments, receipts & dues" actions={<ChildSwitcher />}>
      {student ? <FeesView studentId={student.id} studentName={student.name} /> : <p>No child linked.</p>}
    </PortalPage>
  );
}
