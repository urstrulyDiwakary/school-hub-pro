import { PortalPage } from "@/components/portal/PortalPage";
import { ProfileView } from "@/components/portal/features/ProfileView";
import { useActiveStudent } from "@/hooks/useActiveStudent";

export default function StudentProfile() {
  const { student } = useActiveStudent();
  return (
    <PortalPage title="My Profile" description="Personal & academic details">
      {student && <ProfileView student={student} />}
    </PortalPage>
  );
}
