import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Percent, Medal } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";
import { ResultsProgressChart, SubjectMarksChart } from "@/components/portal/PortalCharts";
import { resultsService } from "@/services/resultsService";
import { cn } from "@/lib/utils";

export function ResultsView({ studentId }: { studentId: string }) {
  const all = resultsService.getAll(studentId);
  const latest = resultsService.getLatest(studentId);
  const trend = resultsService.getProgressTrend(studentId);
  const subjectData = resultsService.getSubjectBreakdown(studentId);
  const avg = resultsService.getAveragePercentage(studentId);

  if (!latest) return <p className="text-sm text-muted-foreground">No results available yet.</p>;

  return (
    <div className="space-y-6">
      <div className="responsive-grid-3">
        <StatCard label="Latest %" value={`${latest.percentage}%`} icon={Percent} tone="primary" hint={latest.examName} />
        <StatCard label="Class Rank" value={`${latest.rank} / ${latest.totalStudents}`} icon={Medal} tone="warning" />
        <StatCard label="Average %" value={`${avg}%`} icon={Trophy} tone="success" hint="Across all exams" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultsProgressChart data={trend} />
        <SubjectMarksChart data={subjectData} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{latest.examName} — Subject Marks</CardTitle>
        </CardHeader>
        <CardContent className="scroll-x-mobile">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Max</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {latest.subjects.map((s) => (
                <tr key={s.subject}>
                  <td className="font-medium">{s.subject}</td>
                  <td>{s.marks}</td>
                  <td>{s.maxMarks}</td>
                  <td>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", s.grade.startsWith("A") ? "bg-success/10 text-success" : "bg-info/10 text-info")}>
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Exam History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {all.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{r.examName}</p>
                <p className="text-xs text-muted-foreground">{r.term} · Rank {r.rank}</p>
              </div>
              <p className="text-sm font-semibold text-primary">{r.percentage}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
