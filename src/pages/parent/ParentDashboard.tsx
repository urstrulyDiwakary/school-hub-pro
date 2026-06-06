import { Link } from "react-router-dom";
import { CalendarCheck, CreditCard, BookOpen, Bell, Trophy, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalPage } from "@/components/portal/PortalPage";
import { StatCard } from "@/components/portal/StatCard";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { useActiveStudent } from "@/hooks/useActiveStudent";
import { attendanceService } from "@/services/attendanceService";
import { feeService, formatINR } from "@/services/feeService";
import { resultsService } from "@/services/resultsService";
import { getHomeworkByStudent } from "@/data/portal/homework";
import { notificationService } from "@/services/notificationService";
import { upcomingExams } from "@/data/portal/academics";

export default function ParentDashboard() {
  const { student } = useActiveStudent();
  if (!student) return <PortalPage title="Parent Dashboard"><p>No child linked to this account.</p></PortalPage>;

  const att = attendanceService.getSummary(student.id);
  const fees = feeService.getSummary(student.id);
  const latest = resultsService.getLatest(student.id);
  const homework = getHomeworkByStudent(student.id);
  const pendingHw = homework.filter((h) => h.status === "pending" || h.status === "overdue").length;
  const notifications = notificationService.getForAudience("parent").slice(0, 4);

  return (
    <PortalPage
      title={`Hello, ${student.name.split(" ")[0]}'s parent`}
      description={`${student.academic.className} - ${student.academic.section} · ${student.academic.classTeacher}`}
      actions={<ChildSwitcher />}
    >
      <div className="responsive-grid-4">
        <StatCard label="Attendance" value={`${att.percentage}%`} icon={CalendarCheck} tone="primary" />
        <StatCard label="Pending Fees" value={formatINR(fees.pending + fees.overdue)} icon={CreditCard} tone="warning" />
        <StatCard label="Pending Homework" value={pendingHw} icon={BookOpen} tone="info" />
        <StatCard label="Latest Result" value={latest ? `${latest.percentage}%` : "—"} icon={Trophy} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Upcoming Exams</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/parent/results">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Recent Notifications</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/parent/communication">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Homework Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {homework.slice(0, 4).map((hw) => (
            <div key={hw.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{hw.title}</p>
                <p className="text-xs text-muted-foreground">{hw.subject} · Due {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
              </div>
              {hw.status === "overdue" && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
