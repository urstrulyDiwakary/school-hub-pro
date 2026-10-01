import { useMemo, useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, Loader2, AlertTriangle, Lightbulb, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { examService } from "@/services/examService";
import { resultService } from "@/services/resultService";
import {
  supportInsightsService,
  type AnalyzeResponse,
  type MarksInput,
  type RiskLevel,
} from "@/services/supportInsightsService";

const riskTone: Record<RiskLevel, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

export default function SupportInsights() {
  const exams = examService.getAll().filter((e) => e.status !== "upcoming");
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const exam = examService.getById(examId);
  const [className, setClassName] = useState(exam?.classes[0] ?? "");
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = exam?.subjects ?? [];

  const students: MarksInput[] = useMemo(
    () =>
      resultService.getByExamClass(examId, className).map((r) => ({
        studentId: r.studentId,
        studentName: r.studentName,
        rollNo: r.rollNo,
        attendance: r.attendancePercentage,
        subjects: r.subjects.map((s) => ({
          subject: s.subject,
          maxMarks: s.maxMarks,
          marks: overrides[`${r.studentId}:${s.subject}`] ?? s.total,
        })),
      })),
    [examId, className, overrides],
  );

  const setMark = (sid: string, subject: string, raw: string, max: number) => {
    const v = Math.min(max, Math.max(0, Number(raw) || 0));
    setOverrides((o) => ({ ...o, [`${sid}:${subject}`]: v }));
    setResult(null);
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportInsightsService.analyze({
        examName: exam?.name ?? examId,
        className,
        passingPercent: exam ? Math.round((exam.passingMarks / exam.maxMarks) * 100) : 33,
        students,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalPage
      title="Student Support Insights"
      description="Enter or review exam marks, then let AI flag students who may need support and suggest class interventions"
      actions={
        <Button onClick={analyze} disabled={loading || !students.length} className="gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze class
        </Button>
      }
    >
      <div className="space-y-6">
        {!supportInsightsService.isAiConnected() && (
          <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            AI service not connected yet — showing results from the built-in rule-based analyzer. Results will switch to AI automatically once the service is connected.
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Exam marks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                value={examId}
                onValueChange={(v) => {
                  setExamId(v);
                  setClassName(examService.getById(v)?.classes[0] ?? "");
                  setOverrides({});
                  setResult(null);
                }}
              >
                <SelectTrigger aria-label="Exam"><SelectValue placeholder="Exam" /></SelectTrigger>
                <SelectContent>
                  {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={className} onValueChange={(v) => { setClassName(v); setOverrides({}); setResult(null); }}>
                <SelectTrigger aria-label="Class"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  {(exam?.classes ?? []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {students.length ? (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student</TableHead>
                      {subjects.map((s) => <TableHead key={s} className="text-center">{s}</TableHead>)}
                      <TableHead className="text-center">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((st) => (
                      <TableRow key={st.studentId}>
                        <TableCell className="text-muted-foreground">{st.rollNo}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{st.studentName}</TableCell>
                        {subjects.map((sub) => {
                          const s = st.subjects.find((x) => x.subject === sub);
                          return (
                            <TableCell key={sub} className="text-center">
                              {s ? (
                                <Input
                                  type="number"
                                  min={0}
                                  max={s.maxMarks}
                                  value={s.marks}
                                  onChange={(e) => setMark(st.studentId, sub, e.target.value, s.maxMarks)}
                                  aria-label={`${sub} marks for ${st.studentName}`}
                                  className="h-9 w-16 mx-auto text-center"
                                />
                              ) : "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">{st.attendance}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No marks available for this selection.</p>
            )}
          </CardContent>
        </Card>

        {error && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <>
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{result.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    Source: {result.source === "ai" ? "AI analysis" : "Rule-based analyzer"} · Suggestions are a starting point; use teacher judgement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4" /> Students who may need support ({result.flagged.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.flagged.length === 0 && <p className="text-sm text-muted-foreground">No students flagged.</p>}
                  {result.flagged.map((f) => (
                    <div key={f.studentId} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{f.studentName} <span className="text-muted-foreground">· Roll {f.rollNo}</span></p>
                        <Badge variant="secondary" className={cn("border-0 capitalize", riskTone[f.risk])}>{f.risk} risk</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.percentage}% overall{f.weakSubjects.length ? ` · Weak: ${f.weakSubjects.join(", ")}` : ""}</p>
                      <ul className="list-disc pl-4 text-xs text-muted-foreground">
                        {f.reasons.map((r) => <li key={r}>{r}</li>)}
                      </ul>
                      <p className="text-sm"><span className="font-medium">Suggested:</span> {f.suggestion}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" /> Class-level interventions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.interventions.length === 0 && <p className="text-sm text-muted-foreground">No class-wide action needed.</p>}
                  {result.interventions.map((i) => (
                    <div key={i.title} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-medium"><Lightbulb className="h-4 w-4 text-primary" />{i.title}</p>
                        <Badge variant="secondary" className={cn("border-0 capitalize", riskTone[i.priority])}>{i.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{i.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PortalPage>
  );
}
