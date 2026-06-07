import { useState } from "react";
import { Printer, Layers } from "lucide-react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportCardPreview } from "@/components/exam/ReportCardPreview";
import { useToast } from "@/hooks/use-toast";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";

export default function ReportCards() {
  const { toast } = useToast();
  const exams = examService.getAll().filter((e) => e.resultStatus === "published" || e.status === "completed");
  const [examId, setExamId] = useState(exams[0]?.id ?? "EXM001");
  const exam = examService.getById(examId);
  const results = resultService.getByExam(examId);
  const [studentId, setStudentId] = useState(results[0]?.studentId ?? "");
  const result = results.find((r) => r.studentId === studentId) ?? results[0];

  return (
    <PortalPage
      title="Report Card Generator"
      description="Generate, preview and export student report cards"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-1" onClick={() => toast({ title: "Bulk generation queued", description: `${results.length} report cards are being generated.` })}>
            <Layers className="h-4 w-4" /> Bulk Generate
          </Button>
          <Button className="gap-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Select Student</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Select value={examId} onValueChange={(v) => { setExamId(v); const r = resultService.getByExam(v); setStudentId(r[0]?.studentId ?? ""); }}>
            <SelectTrigger><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder="Student" /></SelectTrigger>
            <SelectContent>{results.map((r) => <SelectItem key={r.id} value={r.studentId}>{r.studentName} · {r.className}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {result && exam && (
        <ReportCardPreview result={result} examName={exam.name} academicYear={exam.academicYear} />
      )}
    </PortalPage>
  );
}
