import { useMemo, useState, useCallback } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { CheckCircle2, XCircle, Clock, CalendarDays, Flame, Trophy, MessageSquarePlus, Send, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/data/teacherData";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  rollNo: string;
  filteredRecords: AttendanceRecord[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudentDetailModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  rollNo,
  filteredRecords,
}: StudentDetailModalProps) {
  // Build a map of date -> status for this student
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

  // Get unique months from the filtered records
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    filteredRecords.forEach((r) => {
      const d = parseISO(r.date);
      monthSet.add(format(d, "yyyy-MM"));
    });
    return Array.from(monthSet).sort();
  }, [filteredRecords]);

  // Stats & streaks
  const { stats, longestStreak, currentStreak } = useMemo(() => {
    let present = 0, absent = 0, late = 0, total = 0;
    dailyStatus.forEach((status) => {
      total++;
      if (status === "present") present++;
      if (status === "absent") absent++;
      if (status === "late") late++;
    });
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Compute streaks from sorted dates
    const sortedDates = Array.from(dailyStatus.keys()).sort();
    let longest = 0, current = 0, streak = 0;
    for (const dateKey of sortedDates) {
      if (dailyStatus.get(dateKey) === "present") {
        streak++;
        if (streak > longest) longest = streak;
      } else {
        streak = 0;
      }
    }
    // Current streak = streak at the end of sorted dates
    current = streak;

    return {
      stats: { present, absent, late, total, rate },
      longestStreak: longest,
      currentStreak: current,
    };
  }, [dailyStatus]);

  const getStatusColor = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case "present": return "bg-success text-success-foreground";
      case "absent": return "bg-destructive text-destructive-foreground";
      case "late": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBg = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case "present": return "bg-success/20 border-success/30";
      case "absent": return "bg-destructive/20 border-destructive/30";
      case "late": return "bg-warning/20 border-warning/30";
      default: return "bg-muted/40 border-border/30";
    }
  };

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

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="flex flex-col items-center rounded-lg border border-border/50 p-2.5">
            <span className="text-lg font-bold text-foreground">{stats.rate}%</span>
            <span className="text-[10px] text-muted-foreground">Rate</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-success/20 bg-success/5 p-2.5">
            <span className="text-lg font-bold text-success">{stats.present}</span>
            <span className="text-[10px] text-muted-foreground">Present</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
            <span className="text-lg font-bold text-destructive">{stats.absent}</span>
            <span className="text-[10px] text-muted-foreground">Absent</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-warning/20 bg-warning/5 p-2.5">
            <span className="text-lg font-bold text-warning">{stats.late}</span>
            <span className="text-[10px] text-muted-foreground">Late</span>
          </div>
        </div>

        {/* Streak Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{currentStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
              <div className="text-[10px] text-muted-foreground">Current Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{longestStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
              <div className="text-[10px] text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Calendar Heatmap per month */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Daily Attendance Heatmap
          </div>

          {months.map((monthStr) => {
            const monthDate = parseISO(`${monthStr}-01`);
            const days = eachDayOfInterval({
              start: startOfMonth(monthDate),
              end: endOfMonth(monthDate),
            });
            const firstDayOffset = getDay(days[0]);

            return (
              <div key={monthStr} className="rounded-lg border border-border/50 p-3">
                <div className="text-xs font-semibold text-foreground mb-2">
                  {format(monthDate, "MMMM yyyy")}
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}
                  {days.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const status = dailyStatus.get(dateKey);
                    const hasRecord = status !== undefined;
                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "h-8 rounded-md flex items-center justify-center text-[11px] font-medium border transition-colors",
                          hasRecord ? getStatusBg(status) : "bg-background border-transparent"
                        )}
                        title={hasRecord ? `${format(day, "MMM dd")} — ${status}` : format(day, "MMM dd")}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-2 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-success/20 border border-success/30" />
            Present
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-destructive/20 border border-destructive/30" />
            Absent
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-warning/20 border border-warning/30" />
            Late
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-muted/40 border border-border/30" />
            No record
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
