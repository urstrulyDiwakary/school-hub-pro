import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarClock } from "lucide-react";
import { getHomeworkByStudent, type HomeworkStatus } from "@/data/portal/homework";
import { cn } from "@/lib/utils";

const statusMeta: Record<HomeworkStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warning/10 text-warning" },
  submitted: { label: "Submitted", cls: "bg-info/10 text-info" },
  graded: { label: "Graded", cls: "bg-success/10 text-success" },
  overdue: { label: "Overdue", cls: "bg-destructive/10 text-destructive" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function HomeworkView({ studentId }: { studentId: string }) {
  const homework = getHomeworkByStudent(studentId);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {homework.map((hw) => (
        <Card key={hw.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-sm">{hw.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{hw.subject}</p>
                </div>
              </div>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusMeta[hw.status].cls)}>
                {statusMeta[hw.status].label}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{hw.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" /> Due {fmt(hw.dueDate)}
              </span>
              <span>{hw.grade ? `Grade: ${hw.grade}` : hw.teacher}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
