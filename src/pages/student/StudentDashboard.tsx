import { Link } from "react-router-dom";
import { CalendarCheck, BookOpen, Trophy, Receipt, Clock, ChevronRight, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalPage } from "@/components/portal/PortalPage";
import { StatCard } from "@/components/portal/StatCard";
import { useActiveStudent } from "@/hooks/useActiveStudent";
import { attendanceService } from "@/services/attendanceService";
import { feeService, formatINR } from "@/services/feeService";
import { resultsService } from "@/services/resultsService";
import { getHomeworkByStudent } from "@/data/portal/homework";
import { notificationService } from "@/services/notificationService";
import { timetable, upcomingExams } from "@/data/portal/academics";

export default function StudentDashboard() {
  const { student } = useActiveStudent();
  if (!student) return <PortalPage title="Student Dashboard"><p>No student record found.</p></PortalPage>;

  const att = attendanceService.getSummary(student.id);
  const fees = feeService.getSummary(student.id);
  const latest = resultsService.getLatest(student.id);
  const homework = getHomeworkByStudent(student.id);
  const pendingHw = homework.filter((h) => h.status === "pending" || h.status === "overdue").length;
  const notifications = notificationService.getForAudience("student").slice(0, 3);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todaySlots = timetable.filter((s) => s.day === today);

  return (
    <PortalPage title={`Hi, ${student.name.split(" ")[0]}!`} description={`${student.academic.className} - ${student.academic.section} · Roll No. ${student.academic.rollNo}`}>
      <div className="responsive-grid-4">
        <StatCard label="Attendance" value={`${att.percentage}%`} icon={CalendarCheck} tone="primary" />
        <StatCard label="Pending Homework" value={pendingHw} icon={BookOpen} tone="info" />
        <StatCard label="Latest Result" value={latest ? `${latest.percentage}%` : "—"} icon={Trophy} tone="success" />
        <StatCard label="Fees Due" value={formatINR(fees.pending + fees.overdue)} icon={Receipt} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" /> Today's Classes</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/student/timetable">Full timetable <ChevronRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySlots.length === 0 && <p className="text-sm text-muted-foreground">No classes scheduled today.</p>}
            {todaySlots.map((s) => (
              <div key={s.period} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.teacher} · {s.room}</p>
                </div>
                <p className="text-xs font-medium text-muted-foreground">{s.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Upcoming Exams</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcomingExams.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">{e.syllabus}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notifications</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/student/notifications">View all <ChevronRight className="h-4 w-4" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
