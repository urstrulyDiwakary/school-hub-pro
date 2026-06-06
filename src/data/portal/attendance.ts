// Attendance dataset. Daily records are generated deterministically for the
// last ~120 days so analytics, calendars and percentages stay consistent.

export type AttendanceStatus = "present" | "absent" | "late" | "holiday";

export interface AttendanceRecord {
  studentId: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  status: AttendanceStatus;
}

// Deterministic pseudo-random so SSR/CSR and tests agree.
function seeded(n: number): number {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

function generate(studentId: string, seedBase: number, days = 120): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date("2025-06-06T00:00:00+05:30");
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const iso = d.toISOString().slice(0, 10);
    let status: AttendanceStatus;
    if (dow === 0) {
      status = "holiday"; // Sundays off
    } else {
      const r = seeded(seedBase + i);
      if (r > 0.93) status = "absent";
      else if (r > 0.86) status = "late";
      else status = "present";
    }
    records.push({ studentId, date: iso, status });
  }
  return records;
}

export const attendanceRecords: AttendanceRecord[] = [
  ...generate("STU001", 101),
  ...generate("STU002", 211),
];

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  return attendanceRecords
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
