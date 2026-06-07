import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, FileEdit, CalendarClock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { examService } from "@/services/examService";
import { useExamStore } from "@/lib/exam/examStore";
import type { ResultStatus } from "@/data/exam/exams";

const tone: Record<ResultStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/10 text-warning",
  published: "bg-success/10 text-success",
};

export default function ResultPublishing() {
  const { toast } = useToast();
  const exams = examService.getAll();
  const publishStatus = useExamStore((s) => s.publishStatus);
  const scheduledAt = useExamStore((s) => s.scheduledAt);
  const setPublishStatus = useExamStore((s) => s.setPublishStatus);

  const act = (id: string, status: ResultStatus, name: string, when?: string) => {
    setPublishStatus(id, status, when);
    const messages: Record<ResultStatus, string> = {
      published: `${name} results published. Parents & students notified.`,
      draft: `${name} moved back to draft.`,
      scheduled: `${name} scheduled for ${when}.`,
    };
    toast({ title: "Result status updated", description: messages[status] });
  };

  return (
    <PortalPage title="Result Publishing" description="Publish, schedule or revert exam results with notifications">
      <div className="space-y-3">
        {exams.map((e) => {
          const status = publishStatus[e.id] ?? e.resultStatus;
          return (
            <Card key={e.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{e.name}</CardTitle>
                  <Badge variant="secondary" className={cn("border-0 capitalize", tone[status])}>{status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.type} · {e.academicYear}</p>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => act(e.id, "draft", e.name)}>
                  <FileEdit className="h-3.5 w-3.5" /> Draft
                </Button>
                <div className="flex items-center gap-1">
                  <Input type="datetime-local" className="h-9 w-52" defaultValue={scheduledAt[e.id]?.slice(0, 16)} id={`sch-${e.id}`} />
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                    const el = document.getElementById(`sch-${e.id}`) as HTMLInputElement | null;
                    act(e.id, "scheduled", e.name, el?.value || "soon");
                  }}>
                    <CalendarClock className="h-3.5 w-3.5" /> Schedule
                  </Button>
                </div>
                <Button size="sm" className="gap-1" onClick={() => act(e.id, "published", e.name)}>
                  <Send className="h-3.5 w-3.5" /> Publish
                </Button>
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => toast({ title: "Notifications sent", description: `Parents & students notified for ${e.name}.` })}>
                  <Bell className="h-3.5 w-3.5" /> Notify
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PortalPage>
  );
}
