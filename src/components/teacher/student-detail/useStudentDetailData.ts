import { useMemo, useSyncExternalStore } from "react";
import { format, parseISO } from "date-fns";
import type { AttendanceRecord, AttendanceStatus } from "@/data/teacherData";
import type { StudentRemark } from "./types";

export interface StudentStats {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface StudentDetailData {
  dailyStatus: Map<string, AttendanceStatus>;
  months: string[];
  stats: StudentStats;
  longestStreak: number;
  currentStreak: number;
  remarks: StudentRemark[];
}

export const remarksStorageKey = (studentId: string) => `teacher-remarks-${studentId}`;

export function readRemarks(studentId: string): StudentRemark[] {
  try {
    const stored = localStorage.getItem(remarksStorageKey(studentId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Subscribe to localStorage changes (cross-tab + custom events from same tab)
const REMARKS_EVENT = "teacher-remarks-updated";
export function notifyRemarksUpdated(studentId: string) {
  window.dispatchEvent(new CustomEvent(REMARKS_EVENT, { detail: { studentId } }));
}

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(REMARKS_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(REMARKS_EVENT, handler);
  };
}

export function useRemarks(studentId: string): StudentRemark[] {
  // Re-read from storage whenever notified; serialize for stable identity
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(remarksStorageKey(studentId)) ?? "",
    () => "",
  );
  return useMemo(() => {
    if (!snapshot) return [];
    try { return JSON.parse(snapshot) as StudentRemark[]; } catch { return []; }
  }, [snapshot]);
}

export function computeStats(dailyStatus: Map<string, AttendanceStatus>) {
  let present = 0, absent = 0, late = 0, total = 0;
  dailyStatus.forEach((status) => {
    total++;
    if (status === "present") present++;
    if (status === "absent") absent++;
    if (status === "late") late++;
  });
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const sortedDates = Array.from(dailyStatus.keys()).sort();
  let longest = 0, streak = 0;
  for (const dateKey of sortedDates) {
    if (dailyStatus.get(dateKey) === "present") {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 0;
    }
  }

  return {
    stats: { present, absent, late, total, rate } as StudentStats,
    longestStreak: longest,
    currentStreak: streak,
  };
}

export function useStudentDetailData(
  studentId: string,
  filteredRecords: AttendanceRecord[],
): StudentDetailData {
  const dailyStatus = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    filteredRecords.forEach((record) => {
      const studentRecord = record.records.find((r) => r.studentId === studentId);
      if (studentRecord) map.set(record.date, studentRecord.status);
    });
    return map;
  }, [filteredRecords, studentId]);

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    filteredRecords.forEach((r) => monthSet.add(format(parseISO(r.date), "yyyy-MM")));
    return Array.from(monthSet).sort();
  }, [filteredRecords]);

  const { stats, longestStreak, currentStreak } = useMemo(
    () => computeStats(dailyStatus),
    [dailyStatus],
  );

  const remarks = useRemarks(studentId);

  return { dailyStatus, months, stats, longestStreak, currentStreak, remarks };
}
