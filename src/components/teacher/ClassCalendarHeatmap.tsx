import { useMemo } from "react";
import { parseISO, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/data/teacherData";

interface ClassCalendarHeatmapProps {
  filteredRecords: AttendanceRecord[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ClassCalendarHeatmap({ filteredRecords }: ClassCalendarHeatmapProps) {
  // Build date -> { present, absent, late, total, rate } for the whole class
  const { dailyData, months } = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; late: number; total: number }>();

    filteredRecords.forEach((record) => {
      const existing = map.get(record.date) || { present: 0, absent: 0, late: 0, total: 0 };
      record.records.forEach((r) => {
        existing.total++;
        if (r.status === "present") existing.present++;
        if (r.status === "absent") existing.absent++;
        if (r.status === "late") existing.late++;
      });
      map.set(record.date, existing);
    });

    const monthSet = new Set<string>();
    filteredRecords.forEach((r) => {
      monthSet.add(format(parseISO(r.date), "yyyy-MM"));
    });

    return {
      dailyData: map,
      months: Array.from(monthSet).sort(),
    };
  }, [filteredRecords]);

  const getRateBg = (rate: number) => {
    if (rate >= 90) return "bg-success/70 border-success/40";
    if (rate >= 80) return "bg-success/40 border-success/30";
    if (rate >= 70) return "bg-warning/50 border-warning/40";
    if (rate >= 60) return "bg-warning/30 border-warning/20";
    return "bg-destructive/40 border-destructive/30";
  };

  if (filteredRecords.length === 0) return null;

  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Class Attendance Calendar
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Daily overall attendance rate for the entire class
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 sm:h-10" />
                ))}
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const data = dailyData.get(dateKey);
                  const hasData = !!data;
                  const rate = data && data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;

                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        "h-9 sm:h-10 rounded-md flex flex-col items-center justify-center border transition-colors",
                        hasData ? getRateBg(rate) : "bg-background border-transparent"
                      )}
                      title={
                        hasData
                          ? `${format(day, "MMM dd")}: ${rate}% (P:${data!.present} A:${data!.absent} L:${data!.late})`
                          : format(day, "MMM dd")
                      }
                    >
                      <span className={cn("text-[11px] font-medium", hasData ? "text-foreground" : "text-muted-foreground/40")}>
                        {day.getDate()}
                      </span>
                      {hasData && (
                        <span className="text-[8px] font-bold text-foreground/70">{rate}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          <span className="font-medium text-foreground mr-1">Rate:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-success/70 border border-success/40" /> ≥90%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-success/40 border border-success/30" /> 80-89%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-warning/50 border border-warning/40" /> 70-79%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-warning/30 border border-warning/20" /> 60-69%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-destructive/40 border border-destructive/30" /> &lt;60%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
