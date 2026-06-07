import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExamConfig } from "@/data/exam/exams";

const statusTone: Record<ExamConfig["status"], string> = {
  upcoming: "bg-info/10 text-info",
  ongoing: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

const resultTone: Record<ExamConfig["resultStatus"], string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/10 text-warning",
  published: "bg-success/10 text-success",
};

interface ExamTableProps {
  exams: ExamConfig[];
  onSelect?: (exam: ExamConfig) => void;
  actionLabel?: string;
}

/** Reusable exam catalogue table used across config, dashboard and reports. */
export function ExamTable({ exams, onSelect, actionLabel = "View" }: ExamTableProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Year</TableHead>
            <TableHead className="hidden lg:table-cell">Dates</TableHead>
            <TableHead className="hidden sm:table-cell">Classes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            {onSelect && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.name}</TableCell>
              <TableCell>{exam.type}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{exam.academicYear}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                {exam.startDate} – {exam.endDate}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{exam.classes.length}</TableCell>
              <TableCell>
                <Badge className={cn("border-0 capitalize", statusTone[exam.status])} variant="secondary">
                  {exam.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn("border-0 capitalize", resultTone[exam.resultStatus])} variant="secondary">
                  {exam.resultStatus}
                </Badge>
              </TableCell>
              {onSelect && (
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onSelect(exam)}>
                    {actionLabel}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {exams.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No exams found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
