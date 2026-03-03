import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, ArrowUpDown, Hash, User, BarChart3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/data/teacherData";
import StudentDetailModal from "./StudentDetailModal";

interface StudentAttendanceSummaryProps {
  filteredRecords: AttendanceRecord[];
}

interface StudentStat {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
  /** daily scores sorted by date: 1=present, 0.5=late, 0=absent */
  dailyScores: number[];
}

type SortField = "rollNo" | "name" | "rate";

export default function StudentAttendanceSummary({ filteredRecords }: StudentAttendanceSummaryProps) {
  const [sortBy, setSortBy] = useState<SortField>("rollNo");
  const [selectedStudent, setSelectedStudent] = useState<StudentStat | null>(null);
  const studentStats = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, StudentStat>();

    sorted.forEach((record) => {
      record.records.forEach((r) => {
        const score = r.status === "present" ? 1 : r.status === "late" ? 0.5 : 0;
        const existing = map.get(r.studentId);
        if (existing) {
          existing.totalDays++;
          if (r.status === "present") existing.present++;
          if (r.status === "absent") existing.absent++;
          if (r.status === "late") existing.late++;
          existing.dailyScores.push(score);
        } else {
          map.set(r.studentId, {
            studentId: r.studentId,
            studentName: r.studentName,
            rollNo: r.rollNo,
            totalDays: 1,
            present: r.status === "present" ? 1 : 0,
            absent: r.status === "absent" ? 1 : 0,
            late: r.status === "late" ? 1 : 0,
            rate: 0,
            dailyScores: [score],
          });
        }
      });
    });

    const stats = Array.from(map.values()).map((s) => ({
      ...s,
      rate: s.totalDays > 0 ? Math.round((s.present / s.totalDays) * 100) : 0,
    }));

    switch (sortBy) {
      case "name":
        return stats.sort((a, b) => a.studentName.localeCompare(b.studentName));
      case "rate":
        return stats.sort((a, b) => a.rate - b.rate);
      default:
        return stats.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
    }
  }, [filteredRecords, sortBy]);

  if (filteredRecords.length === 0 || studentStats.length === 0) return null;

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "[&>div]:bg-success";
    if (rate >= 75) return "[&>div]:bg-warning";
    return "[&>div]:bg-destructive";
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (rate >= 75) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const Sparkline = ({ scores, rate }: { scores: number[]; rate: number }) => {
    if (scores.length < 2) return null;
    const w = 60, h = 20, padding = 2;
    const stepX = (w - padding * 2) / (scores.length - 1);
    const points = scores.map((s, i) => `${padding + i * stepX},${padding + (1 - s) * (h - padding * 2)}`).join(" ");
    const color = rate >= 90 ? "hsl(var(--success))" : rate >= 75 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
    return (
      <svg width={w} height={h} className="shrink-0 hidden md:block">
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {scores.map((s, i) => (
          <circle key={i} cx={padding + i * stepX} cy={padding + (1 - s) * (h - padding * 2)} r="2" fill={s === 1 ? "hsl(var(--success))" : s === 0.5 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
        ))}
      </svg>
    );
  };

  const avgRate = studentStats.length > 0
    ? Math.round(studentStats.reduce((sum, s) => sum + s.rate, 0) / studentStats.length)
    : 0;
  const belowThreshold = studentStats.filter((s) => s.rate < 75).length;

  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Student-wise Attendance Summary
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Avg: <strong className={getStatusColor(avgRate)}>{avgRate}%</strong></span>
              {belowThreshold > 0 && (
                <span className="text-destructive font-medium">
                  {belowThreshold} below 75%
                </span>
              )}
            </div>
            <ToggleGroup
              type="single"
              value={sortBy}
              onValueChange={(v) => v && setSortBy(v as SortField)}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="rollNo" aria-label="Sort by roll number">
                <Hash className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="name" aria-label="Sort by name">
                <User className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="rate" aria-label="Sort by attendance rate">
                <BarChart3 className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {studentStats.map((student) => (
            <div
              key={student.studentId}
              onClick={() => setSelectedStudent(student)}
              className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30 cursor-pointer"
            >
              {/* Roll No & Name */}
              <div className="flex items-center gap-2 min-w-0 w-40 shrink-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                  {student.rollNo}
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {student.studentName}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 min-w-0">
                <Progress
                  value={student.rate}
                  className={cn("h-2.5 bg-muted", getProgressColor(student.rate))}
                />
              </div>

              {/* Sparkline */}
              <Sparkline scores={student.dailyScores} rate={student.rate} />

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex gap-2 text-xs text-muted-foreground">
                  <span className="text-success">{student.present}P</span>
                  <span className="text-destructive">{student.absent}A</span>
                  <span className="text-warning">{student.late}L</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-[52px] justify-end">
                  {getStatusIcon(student.rate)}
                  <span className={cn("text-sm font-bold", getStatusColor(student.rate))}>
                    {student.rate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span>≥ 90% (Excellent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span>75–89% (Needs attention)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span>&lt; 75% (Critical)</span>
          </div>
        </div>
      </CardContent>

      {selectedStudent && (
        <StudentDetailModal
          open={!!selectedStudent}
          onOpenChange={(open) => !open && setSelectedStudent(null)}
          studentId={selectedStudent.studentId}
          studentName={selectedStudent.studentName}
          rollNo={selectedStudent.rollNo}
          filteredRecords={filteredRecords}
        />
      )}
    </Card>
  );
}
