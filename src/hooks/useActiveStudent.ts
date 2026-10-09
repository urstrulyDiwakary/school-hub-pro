import { useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { usePortalStore } from "@/lib/portalStore";
import { getStudentById, getStudentsByParent, type Student } from "@/data/portal/students";
import { getParentById } from "@/data/portal/parents";
import { toPortalStudent, useLiveStudents } from "@/hooks/useLiveSchool";

/**
 * Resolves the student whose data the current portal page should display.
 *
 *  - Real parent accounts see children linked with a school code.
 *  - Demo parents/students see the sample dataset.
 */
export function useActiveStudent(): {
  student: Student | undefined;
  children: Student[];
  isParent: boolean;
  isLive: boolean;
  isLoading: boolean;
} {
  const user = useAuthStore((s) => s.user);
  const selectedStudentId = usePortalStore((s) => s.selectedStudentId);
  const isLive = !!user?.live;
  const live = useLiveStudents(isLive && (user?.role === "parent" || user?.role === "student"));

  return useMemo(() => {
    if (!user) return { student: undefined, children: [], isParent: false, isLive, isLoading: false };

    if (user.role === "parent") {
      let children: Student[];
      if (isLive) {
        children = (live.data ?? []).map(toPortalStudent);
      } else {
        const parent = getParentById("PAR001");
        children = parent
          ? getStudentsByParent(parent.id)
          : ((user.studentIds ?? []).map(getStudentById).filter(Boolean) as Student[]);
      }
      const active = children.find((c) => c.id === selectedStudentId) ?? children[0];
      return { student: active, children, isParent: true, isLive, isLoading: isLive && live.isLoading };
    }

    if (isLive) {
      const children = (live.data ?? []).map(toPortalStudent);
      const active = children.find((c) => c.id === selectedStudentId) ?? children[0];
      return { student: active, children, isParent: false, isLive, isLoading: live.isLoading };
    }
    const id = user.studentIds?.[0] ?? "STU001";
    const student = getStudentById(id);
    return { student, children: student ? [student] : [], isParent: false, isLive, isLoading: false };
  }, [user, selectedStudentId, isLive, live.data, live.isLoading]);
}
