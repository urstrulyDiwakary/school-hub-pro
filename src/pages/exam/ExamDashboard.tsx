import { CalendarClock, CheckCircle2, FileCheck2, Hourglass, TrendingUp, Trophy } from "lucide-react";
import { PortalPage } from "@/components/portal/PortalPage";
import { StatCard } from "@/components/portal/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClassComparisonChart,
  MonthlyActivityChart,
  PassPercentageChart,
  SubjectPerformanceChart,
} from "@/components/exam/ExamCharts";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";
import { getResultsByExam } from "@/data/exam/results";
import { monthlyExamActivity } from "@/data/exam/exams";

export default function ExamDashboard() {
  const stats = examService.dashboardStats();
  const published = getResultsByExam("EXM001");

  const classes = [...new Set(published.map((r) => r.className))];
  const passByClass = classes.map((c) => ({
    label: c.replace("Class ", "C"),
    value: resultService.passPercentage(published.filter((r) => r.className === c)),
  }));
  const avgByClass = classes.map((c) => {
    const rows = published.filter((r) => r.className === c);
    return {
      label: c,
      value: Math.round((rows.reduce((s, r) => s + r.percentage, 0) / rows.length) * 10) / 10,
    };
  });
  const subjectPerf = resultService.subjectAverages(published);
  const overallPass = resultService.passPercentage(published);
  const topPerformers = resultService.topPerformers(published, 5);

  return (
    <PortalPage title="Examination Dashboard" description="Overview of exams, results and performance">
      <div className="responsive-grid-4">
        <StatCard label="Upcoming Exams" value={stats.upcoming} icon={CalendarClock} tone="info" />
        <StatCard label="Completed Exams" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Results Published" value={stats.published} icon={FileCheck2} tone="primary" />
        <StatCard label="Pending Evaluations" value={stats.pendingEvaluations} icon={Hourglass} tone="warning" />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2">
        <StatCard label="Class Performance (Avg)" value={`${overallPass}%`} icon={TrendingUp} tone="success" hint="Across published results" />
        <StatCard label="Top Performers" value={topPerformers.length} icon={Trophy} tone="warning" hint="Ranked students" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <PassPercentageChart data={passByClass} />
        <SubjectPerformanceChart data={subjectPerf} />
        <ClassComparisonChart data={avgByClass} />
        <MonthlyActivityChart data={monthlyExamActivity} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" /> Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topPerformers.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{r.rank}</span>
                <div>
                  <p className="text-sm font-medium">{r.studentName}</p>
                  <p className="text-xs text-muted-foreground">{r.className}</p>
                </div>
              </div>
              <Badge variant="secondary" className="border-0 bg-success/10 text-success">{r.percentage}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
