import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import type { StudentResult } from "@/data/exam/results";

interface ReportCardPreviewProps {
  result: StudentResult;
  examName: string;
  academicYear: string;
  teacherRemark?: string;
  principalRemark?: string;
}

/** Printable report card layout. Uses semantic tokens so it themes correctly. */
export function ReportCardPreview({
  result,
  examName,
  academicYear,
  teacherRemark = "Consistent performer. Keep up the steady effort and focus on weaker areas.",
  principalRemark = "A promising student. We expect even better results next term.",
}: ReportCardPreviewProps) {
  return (
    <div className="rounded-xl border bg-card p-5 sm:p-8 space-y-6 print:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">EduTrack Pro School</h2>
            <p className="text-xs text-muted-foreground">Academic Report Card · {academicYear}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{examName}</p>
          <p className="text-xs text-muted-foreground">Rank #{result.rank}</p>
        </div>
      </div>

      {/* Student profile + attendance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 text-sm">
          <Field label="Student" value={result.studentName} />
          <Field label="Roll No" value={result.rollNo} />
          <Field label="Class" value={`${result.className} - ${result.section}`} />
        </div>
        <div className="space-y-1 text-sm">
          <Field label="Overall %" value={`${result.percentage}%`} />
          <Field label="Grade" value={result.grade} />
          <Field label="Attendance" value={`${result.attendancePercentage}%`} />
        </div>
      </div>

      {/* Marks */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Theory</TableHead>
              <TableHead className="text-center">Practical</TableHead>
              <TableHead className="text-center">Internal</TableHead>
              <TableHead className="text-center">Viva</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.subjects.map((s) => (
              <TableRow key={s.subject}>
                <TableCell className="font-medium">{s.subject}</TableCell>
                <TableCell className="text-center">{s.theory}</TableCell>
                <TableCell className="text-center">{s.practical}</TableCell>
                <TableCell className="text-center">{s.internal}</TableCell>
                <TableCell className="text-center">{s.viva}</TableCell>
                <TableCell className="text-center font-semibold">{s.total}/{s.maxMarks}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="border-0">{s.grade}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Summary label="Total Marks" value={`${result.totalMarks}/${result.maxTotal}`} />
        <Summary label="Percentage" value={`${result.percentage}%`} />
        <Summary label="GPA" value={result.gpa.toFixed(1)} />
      </div>

      {/* Remarks */}
      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-muted-foreground">Class Teacher's Remark</p>
          <p className="mt-1">{teacherRemark}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-muted-foreground">Principal's Remark</p>
          <p className="mt-1">{principalRemark}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}
