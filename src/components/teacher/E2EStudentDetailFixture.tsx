/**
 * E2E-only fixture that mounts the StudentDetailModal directly from any host
 * route when `?e2e=studentDetail` is present in the URL. This lets Playwright
 * smoke tests open the modal deterministically as either admin or teacher
 * without depending on intermediate UI (table rows, search, dropdowns).
 *
 * Why a fixture? The export dropdown's role is derived from the current path
 * (`resolveEffectivePermissions`). Mounting on the host route preserves that
 * detection, so:
 *   - On `/students?e2e=studentDetail`     → admin perms (CSV + PDF)
 *   - On `/teacher/dashboard?e2e=studentDetail` → teacher perms (PDF only)
 *
 * Renders nothing in normal use. The component opts out unless the query
 * string explicitly enables it, so production behaviour is unaffected.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import StudentDetailModal from "./StudentDetailModal";
import type { AttendanceRecord, AttendanceStatus } from "@/data/teacherData";

export default function E2EStudentDetailFixture() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const enabled = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("e2e") === "studentDetail";
  }, [location.search]);

  useEffect(() => {
    if (enabled) setOpen(true);
  }, [enabled]);

  if (!enabled) return null;

  // Deterministic synthetic attendance — keeps export contents stable across runs.
  const records: AttendanceRecord[] = (
    [
      ["2025-01-01", "present"],
      ["2025-01-02", "absent"],
      ["2025-01-03", "present"],
      ["2025-01-06", "late"],
      ["2025-01-07", "present"],
    ] as const
  ).map(([date, status]) => ({
    date,
    status: status as AttendanceStatus,
    studentId: "e2e-student-1",
    classId: "e2e-class-1",
  }));

  return (
    <div data-testid="e2e-student-detail-fixture">
      <StudentDetailModal
        open={open}
        onOpenChange={setOpen}
        studentId="e2e-student-1"
        studentName="E2E Test Student"
        rollNo="E2E-1"
        filteredRecords={records}
      />
    </div>
  );
}
