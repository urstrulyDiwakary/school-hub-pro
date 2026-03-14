import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/data/teacherData";
import { WEEKDAYS, getStatusBg } from "./types";

interface StudentCalendarHeatmapProps {
  months: string[];
  dailyStatus: Map<string, AttendanceStatus>;
}

export default function StudentCalendarHeatmap({ months, dailyStatus }: StudentCalendarHeatmapProps) {
  return (
    <>
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
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
                    {d}
                  </div>
                ))}
              </div>
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
    </>
  );
}
