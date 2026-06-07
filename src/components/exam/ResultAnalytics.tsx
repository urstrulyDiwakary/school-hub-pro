import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { resultService } from "@/services/resultService";
import {
  GradeDistributionChart,
  SubjectPerformanceChart,
} from "@/components/exam/ExamCharts";
import type { StudentResult } from "@/data/exam/results";

interface ResultAnalyticsProps {
  results: StudentResult[];
}

/** Analytics panel: subject averages, grade distribution and top performers. */
export function ResultAnalytics({ results }: ResultAnalyticsProps) {
  const subjectAverages = resultService.subjectAverages(results);
  const gradeDistribution = resultService.gradeDistribution(results);
  const topPerformers = resultService.topPerformers(results, 5);
  const passPct = resultService.passPercentage(results);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <SubjectPerformanceChart data={subjectAverages} />
        <GradeDistributionChart data={gradeDistribution} />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {r.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground">{r.className} · {r.rollNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{r.percentage}%</p>
                  <Badge variant="secondary" className="border-0 bg-success/10 text-success">{r.grade}</Badge>
                </div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No results available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Pass Percentage</p>
              <p className="mt-1 text-2xl font-bold text-success">{passPct}%</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Students Evaluated</p>
              <p className="mt-1 text-2xl font-bold">{results.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Failures</p>
              <p className="mt-1 text-2xl font-bold text-destructive">
                {resultService.failures(results).length}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Class Average</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {results.length
                  ? Math.round((results.reduce((s, r) => s + r.percentage, 0) / results.length) * 10) / 10
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
