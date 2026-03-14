import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AttendanceRecord, AttendanceStatus } from "@/data/teacherData";
import StudentStatsCards from "./student-detail/StudentStatsCards";
import StudentCalendarHeatmap from "./student-detail/StudentCalendarHeatmap";
import StudentRemarksSection from "./student-detail/StudentRemarksSection";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  rollNo: string;
  filteredRecords: AttendanceRecord[];
}

export default function StudentDetailModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  rollNo,
  filteredRecords,
}: StudentDetailModalProps) {
  const dailyStatus = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    filteredRecords.forEach((record) => {
      const studentRecord = record.records.find((r) => r.studentId === studentId);
      if (studentRecord) {
        map.set(record.date, studentRecord.status);
      }
    });
    return map;
  }, [filteredRecords, studentId]);

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    filteredRecords.forEach((r) => {
      const d = parseISO(r.date);
      monthSet.add(format(d, "yyyy-MM"));
    });
    return Array.from(monthSet).sort();
  }, [filteredRecords]);

  const { stats, longestStreak, currentStreak } = useMemo(() => {
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
      stats: { present, absent, late, total, rate },
      longestStreak: longest,
      currentStreak: streak,
    };
  }, [dailyStatus]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {rollNo}
            </span>
            <div>
              <div className="text-base font-semibold">{studentName}</div>
              <div className="text-xs font-normal text-muted-foreground">
                Roll No: {rollNo} • {stats.total} days tracked
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <StudentStatsCards stats={stats} currentStreak={currentStreak} longestStreak={longestStreak} />
        <StudentCalendarHeatmap months={months} dailyStatus={dailyStatus} />
        <StudentRemarksSection studentId={studentId} />
      </DialogContent>
    </Dialog>
  );
}
