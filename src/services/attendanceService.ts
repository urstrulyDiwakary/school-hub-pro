// Attendance service: derives percentages, monthly analytics and calendar
// data from the raw dataset. UI components consume these, never the raw data.

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

export const attendanceService = {
  getRecords(studentId: string): AttendanceRecord[] {
    return getAttendanceByStudent(studentId);
  },

  getSummary(studentId: string): AttendanceSummary {
    return summarize(getAttendanceByStudent(studentId));
  },

  /** Most recent N daily records. */
  getRecent(studentId: string, n = 10): AttendanceRecord[] {
    return getAttendanceByStudent(studentId).slice(0, n);
  },

  /** Monthly percentage trend for charts. */
  getMonthlyTrend(studentId: string): { month: string; percentage: number }[] {
    const records = getAttendanceByStudent(studentId);
    const buckets = new Map<string, AttendanceRecord[]>();
    for (const r of records) {
      const key = r.date.slice(0, 7); // yyyy-mm
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(r);
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, recs]) => {
        const d = new Date(key + "-01");
        const month = d.toLocaleString("en-IN", { month: "short" });
        return { month, percentage: summarize(recs).percentage };
      });
  },

  /** Status distribution for pie charts. */
  getDistribution(studentId: string): { name: string; value: number; status: AttendanceStatus }[] {
    const s = summarize(getAttendanceByStudent(studentId));
    return [
      { name: "Present", value: s.present, status: "present" },
      { name: "Late", value: s.late, status: "late" },
      { name: "Absent", value: s.absent, status: "absent" },
    ];
  },

  /** Recent absences for alert surfacing. */
  getAbsentAlerts(studentId: string, n = 5): AttendanceRecord[] {
    return getAttendanceByStudent(studentId)
      .filter((r) => r.status === "absent")
      .slice(0, n);
  },
};
