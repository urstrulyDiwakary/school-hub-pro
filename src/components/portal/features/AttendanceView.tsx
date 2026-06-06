import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";
import {
  AttendancePieChart,
  AttendanceTrendChart,
} from "@/components/portal/PortalCharts";
import { attendanceService } from "@/services/attendanceService";
import type { AttendanceStatus } from "@/data/portal/attendance";
import { cn } from "@/lib/utils";

const statusMeta: Record<AttendanceStatus, { label: string; cls: string }> = {
  present: { label: "Present", cls: "bg-success/10 text-success" },
  late: { label: "Late", cls: "bg-warning/10 text-warning" },
  absent: { label: "Absent", cls: "bg-destructive/10 text-destructive" },
  holiday: { label: "Holiday", cls: "bg-muted text-muted-foreground" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function AttendanceView({ studentId }: { studentId: string }) {
  const summary = attendanceService.getSummary(studentId);
  const trend = attendanceService.getMonthlyTrend(studentId);
  const distribution = attendanceService.getDistribution(studentId);
  const recent = attendanceService.getRecent(studentId, 14);
  const absences = attendanceService.getAbsentAlerts(studentId, 5);

  return (
    <div className="space-y-6">
      <div className="responsive-grid-4">
        <StatCard label="Attendance %" value={`${summary.percentage}%`} icon={CalendarCheck} tone="primary" hint={`${summary.workingDays} working days`} />
        <StatCard label="Present" value={summary.present} icon={CheckCircle2} tone="success" />
        <StatCard label="Late" value={summary.late} icon={Clock} tone="warning" />
        <StatCard label="Absent" value={summary.absent} icon={XCircle} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AttendanceTrendChart data={trend} />
        <AttendancePieChart data={distribution} />
      </div>

      {absences.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Absent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {absences.map((a) => (
                <li
                  key={a.date}
                  className="flex items-center gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-sm"
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                  Marked absent on {formatDate(a.date)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="scroll-x-mobile">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.date}>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusMeta[r.status].cls,
                      )}
                    >
                      {statusMeta[r.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
