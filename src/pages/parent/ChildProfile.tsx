import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { ProfileView } from "@/components/portal/features/ProfileView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function ChildProfile() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="Child Profile" description="Personal, academic & emergency details" actions={<ChildSwitcher />}>
      {student ? <ProfileView student={student} /> : <p>No child linked.</p>}
    </PortalPage>
  );
}
