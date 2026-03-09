import { useMemo } from "react";
import { parseISO, getDay, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/data/teacherData";

interface WeeklyAttendanceHeatmapProps {
  filteredRecords: AttendanceRecord[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyAttendanceHeatmap({ filteredRecords }: WeeklyAttendanceHeatmapProps) {
  const heatmapData = useMemo(() => {
    // For each day of week, compute present/absent/late/total counts
    const days = DAYS.map(() => ({ present: 0, absent: 0, late: 0, total: 0 }));

    filteredRecords.forEach((record) => {
      const dayIndex = getDay(parseISO(record.date));
      record.records.forEach((r) => {
        days[dayIndex].total++;
        if (r.status === "present") days[dayIndex].present++;
        if (r.status === "absent") days[dayIndex].absent++;
        if (r.status === "late") days[dayIndex].late++;
      });
    });

    return days.map((d, i) => ({
      day: DAYS[i],
      ...d,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
      absentRate: d.total > 0 ? Math.round((d.absent / d.total) * 100) : 0,
      lateRate: d.total > 0 ? Math.round((d.late / d.total) * 100) : 0,
    }));
  }, [filteredRecords]);

  const maxTotal = Math.max(...heatmapData.map((d) => d.total), 1);

  const getRateColor = (rate: number, hasData: boolean) => {
    if (!hasData) return "bg-muted/30";
    if (rate >= 90) return "bg-success/80";
    if (rate >= 75) return "bg-success/40";
    if (rate >= 60) return "bg-warning/50";
    return "bg-destructive/50";
  };

  const getRateTextColor = (rate: number, hasData: boolean) => {
    if (!hasData) return "text-muted-foreground";
    if (rate >= 75) return "text-success";
    if (rate >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Weekly Attendance Patterns
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Attendance distribution across days of the week
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.map((d) => {
            const hasData = d.total > 0;
            return (
              <div key={d.day} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">{d.day}</span>
                <div
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center transition-colors border",
                    getRateColor(d.rate, hasData),
                    hasData ? "border-border/30" : "border-border/20"
                  )}
                  title={hasData ? `${d.day}: ${d.rate}% attendance (${d.present}P / ${d.absent}A / ${d.late}L)` : `${d.day}: No data`}
                >
                  <span className={cn("text-sm font-bold", hasData ? "text-foreground" : "text-muted-foreground/50")}>
                    {hasData ? `${d.rate}%` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Breakdown Bars */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          {heatmapData.filter((d) => d.total > 0).map((d) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-8">{d.day}</span>
              <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-muted/30">
                {d.present > 0 && (
                  <div
                    className="bg-success/70 transition-all"
                    style={{ width: `${(d.present / d.total) * 100}%` }}
                    title={`Present: ${d.present}`}
                  />
                )}
                {d.late > 0 && (
                  <div
                    className="bg-warning/70 transition-all"
                    style={{ width: `${(d.late / d.total) * 100}%` }}
                    title={`Late: ${d.late}`}
                  />
                )}
                {d.absent > 0 && (
                  <div
                    className="bg-destructive/70 transition-all"
                    style={{ width: `${(d.absent / d.total) * 100}%` }}
                    title={`Absent: ${d.absent}`}
                  />
                )}
              </div>
              <span className={cn("text-xs font-semibold w-10 text-right", getRateTextColor(d.rate, true))}>
                {d.rate}%
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-success/70" /> Present
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-warning/70" /> Late
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-destructive/70" /> Absent
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
