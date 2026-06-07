import { useMemo, useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MarksEntryGrid, type MarksRow } from "@/components/exam/MarksEntryGrid";
import { useToast } from "@/hooks/use-toast";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";

export default function MarksEntry() {
  const { toast } = useToast();
  const completedExams = examService.getAll().filter((e) => e.status !== "upcoming");
  const [examId, setExamId] = useState(completedExams[0]?.id ?? "EXM001");
  const exam = examService.getById(examId);
  const [className, setClassName] = useState(exam?.classes[0] ?? "Class 10");
  const [subject, setSubject] = useState(exam?.subjects[0] ?? "Mathematics");

  const draftKey = `${examId}:${className}:${subject}`;

  const rows: MarksRow[] = useMemo(() => {
    const results = resultService.getByExamClass(examId, className);
    return results.map((r) => {
      const s = r.subjects.find((x) => x.subject === subject) ?? r.subjects[0];
      return {
        studentId: r.studentId,
        studentName: r.studentName,
        rollNo: r.rollNo,
        theory: s?.theory ?? 0,
        practical: s?.practical ?? 0,
        internal: s?.internal ?? 0,
        viva: s?.viva ?? 0,
      };
    });
  }, [examId, className, subject]);

  return (
    <PortalPage
      title="Marks Entry"
      description="Class & subject-wise marks entry with validation and auto-save"
      actions={
        <Button
          className="gap-1"
          onClick={() => toast({ title: "Submitted for approval", description: `${className} · ${subject} marks sent to evaluation center.` })}
        >
          <Send className="h-4 w-4" /> Submit Marks
        </Button>
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Class & Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={examId} onValueChange={(v) => { setExamId(v); const e = examService.getById(v); setClassName(e?.classes[0] ?? "Class 10"); setSubject(e?.subjects[0] ?? "Mathematics"); }}>
              <SelectTrigger><SelectValue placeholder="Exam" /></SelectTrigger>
              <SelectContent>
                {completedExams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {(exam?.classes ?? []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                {(exam?.subjects ?? []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {rows.length > 0 ? (
            <MarksEntryGrid
              draftKey={draftKey}
              rows={rows}
              maxMarks={exam?.maxMarks ?? 100}
              passingMarks={exam?.passingMarks ?? 33}
            />
          ) : (
            <p className="py-8 text-center text-muted-foreground">No roster available for this selection.</p>
          )}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
