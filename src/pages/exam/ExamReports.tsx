import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileWarning, ListOrdered, Percent, BookOpen, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";

const reportTypes = [
  { id: "result", title: "Result Analysis", icon: BarChart3, color: "bg-primary/10 text-primary" },
  { id: "subject", title: "Subject Analysis", icon: BookOpen, color: "bg-info/10 text-info" },
  { id: "rank", title: "Rank Reports", icon: ListOrdered, color: "bg-warning/10 text-warning" },
  { id: "failure", title: "Failure Reports", icon: FileWarning, color: "bg-destructive/10 text-destructive" },
  { id: "pass", title: "Pass Percentage", icon: Percent, color: "bg-success/10 text-success" },
] as const;

export default function ExamReports() {
  const exams = examService.getAll().filter((e) => resultService.getByExam(e.id).length > 0);
  const [examId, setExamId] = useState(exams[0]?.id ?? "EXM001");
  const [report, setReport] = useState<(typeof reportTypes)[number]["id"]>("rank");
  const results = resultService.getByExam(examId);
  const ranked = resultService.topPerformers(results, results.length);
  const failures = resultService.failures(results);

  return (
    <PortalPage
      title="Exam Reports"
      description="Result, subject, rank, failure and pass-percentage reports"
      actions={
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      }
    >
      <div className="responsive-grid-3">
        {reportTypes.map((r) => (
          <Card key={r.id} className={cn("stat-card cursor-pointer", report === r.id && "ring-2 ring-primary")} onClick={() => setReport(r.id)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("stat-card-icon", r.color)}><r.icon className="h-5 w-5" /></div>
                <p className="text-sm font-semibold">{r.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{reportTypes.find((r) => r.id === report)?.title}</h3>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
          </div>

          {report === "pass" ? (
            <p className="text-3xl font-bold text-success">{resultService.passPercentage(results)}%
              <span className="ml-2 text-sm font-normal text-muted-foreground">overall pass rate</span></p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{report === "rank" ? "Rank" : "#"}</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report === "failure" ? failures : ranked).map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{report === "rank" ? r.rank : i + 1}</TableCell>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.className}</TableCell>
                      <TableCell className="text-center">{r.percentage}%</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary" className="border-0">{r.grade}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {report === "failure" && failures.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No failures — all students passed.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
