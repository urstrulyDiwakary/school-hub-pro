// Attendance service: derives percentages, monthly analytics and calendar
// data from attendance records. Works for sample data (by student id) and
// for real records passed in directly (`fromRecords`).

import {
  getAttendanceByStudent,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/data/portal/attendance";

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  holidays: number;
  /** Working days = total - holidays. */
  workingDays: number;
  percentage: number;
}

function summarize(records: AttendanceRecord[]): AttendanceSummary {
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const holidays = records.filter((r) => r.status === "holiday").length;
  const workingDays = records.length - holidays;
  // Late counts as present for percentage purposes.
  const percentage = workingDays === 0 ? 0 : Math.round(((present + late) / workingDays) * 1000) / 10;
  return { total: records.length, present, absent, late, holidays, workingDays, percentage };
}

/** Analytics over an already-loaded, newest-first record list. */
export function fromRecords(records: AttendanceRecord[]) {
  return {
    summary: summarize(records),
    recent: (n = 10) => records.slice(0, n),
    monthlyTrend: (): { month: string; percentage: number }[] => {
      const buckets = new Map<string, AttendanceRecord[]>();
      for (const r of records) {
        const key = r.date.slice(0, 7);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(r);
      }
      return Array.from(buckets.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, recs]) => ({
          month: new Date(key + "-01").toLocaleString("en-IN", { month: "short" }),
          percentage: summarize(recs).percentage,
        }));
    },
    distribution: (): { name: string; value: number; status: AttendanceStatus }[] => {
      const s = summarize(records);
      return [
        { name: "Present", value: s.present, status: "present" },
        { name: "Late", value: s.late, status: "late" },
        { name: "Absent", value: s.absent, status: "absent" },
      ];
    },
    absences: (n = 5) => records.filter((r) => r.status === "absent").slice(0, n),
  };
}

export const attendanceService = {
  getRecords(studentId: string): AttendanceRecord[] {
    return getAttendanceByStudent(studentId);
  },
  getSummary(studentId: string): AttendanceSummary {
    return summarize(getAttendanceByStudent(studentId));
  },
  getRecent(studentId: string, n = 10): AttendanceRecord[] {
    return getAttendanceByStudent(studentId).slice(0, n);
  },
  getMonthlyTrend(studentId: string) {
    return fromRecords(getAttendanceByStudent(studentId)).monthlyTrend();
  },
  getDistribution(studentId: string) {
    return fromRecords(getAttendanceByStudent(studentId)).distribution();
  },
  getAbsentAlerts(studentId: string, n = 5): AttendanceRecord[] {
    return fromRecords(getAttendanceByStudent(studentId)).absences(n);
  },
};
