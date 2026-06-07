import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultAnalytics } from "@/components/exam/ResultAnalytics";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";

export default function ExamAnalytics() {
  const exams = examService.getAll().filter((e) => resultService.getByExam(e.id).length > 0);
  const [examId, setExamId] = useState(exams[0]?.id ?? "EXM001");
  const results = resultService.getByExam(examId);

  return (
    <PortalPage
      title="Performance Analytics"
      description="Student, class and school-level exam performance insights"
      actions={
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      }
    >
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Department / Subject Effectiveness</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {resultService.subjectAverages(results).map((s) => (
            <div key={s.subject} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium">{s.subject}</div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-success" style={{ width: `${s.average}%` }} />
              </div>
              <div className="w-12 text-right text-sm font-semibold">{s.average}%</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ResultAnalytics results={results} />
    </PortalPage>
  );
}
