import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { examService } from "@/services/examService";
import { subjectList } from "@/data/exam/exams";

const rows = examService.getAll().flatMap((e) =>
  e.subjects.slice(0, 3).map((subject, i) => ({
    id: `${e.id}-${subject}`,
    exam: e.name,
    subject,
    teacher: ["Mr. Rajesh Kumar", "Ms. Priya Sharma", "Mr. Anil Verma"][i % 3],
    status: e.resultStatus === "published" ? "approved" : i === 0 ? "pending" : "submitted",
  })),
);

const tone = {
  pending: "bg-warning/10 text-warning",
  submitted: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
} as const;

export default function EvaluationCenter() {
  const { toast } = useToast();
  const pending = rows.filter((r) => r.status !== "approved").length;

  return (
    <PortalPage title="Teacher Evaluation Center" description="Track paper evaluation status and approve marks">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Papers</p><p className="mt-1 text-2xl font-bold text-warning">{pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Subjects</p><p className="mt-1 text-2xl font-bold">{subjectList.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Approved</p><p className="mt-1 text-2xl font-bold text-success">{rows.filter((r) => r.status === "approved").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Evaluation Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Evaluator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.exam}</TableCell>
                    <TableCell>{r.subject}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{r.teacher}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("border-0 capitalize", tone[r.status as keyof typeof tone])}>
                        {r.status === "approved" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={r.status === "approved"} onClick={() => toast({ title: "Marks approved", description: `${r.subject} · ${r.exam}` })}>
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PortalPage>
  );
}
