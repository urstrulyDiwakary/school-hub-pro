import { useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { usePortalStore } from "@/lib/portalStore";
import { getStudentById, getStudentsByParent, type Student } from "@/data/portal/students";
import { getParentById } from "@/data/portal/parents";

/**
 * Resolves the student whose data the current portal page should display.
 *
 *  - Students see their own record.
 *  - Parents see the selected child (defaults to the first child) and can
 *    switch between children via the portal store.
 */
export function useActiveStudent(): {
  student: Student | undefined;
  children: Student[];
  isParent: boolean;
} {
  const user = useAuthStore((s) => s.user);
  const selectedStudentId = usePortalStore((s) => s.selectedStudentId);

  return useMemo(() => {
    if (!user) return { student: undefined, children: [], isParent: false };

    if (user.role === "parent") {
      const parent = getParentById("PAR001");
      const children = parent
        ? getStudentsByParent(parent.id)
        : (user.studentIds ?? []).map(getStudentById).filter(Boolean) as Student[];
      const active =
        children.find((c) => c.id === selectedStudentId) ?? children[0];
      return { student: active, children, isParent: true };
    }

    // Student (or anyone else) — own record.
    const id = user.studentIds?.[0] ?? "STU001";
    const student = getStudentById(id);
    return { student, children: student ? [student] : [], isParent: false };
  }, [user, selectedStudentId]);
}
