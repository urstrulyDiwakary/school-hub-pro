import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, FileCode2, History, AlertTriangle, CheckCircle2 } from "lucide-react";
import { auditLogStore, type ExportAuditEntry } from "@/lib/exportAuditLog";
import type { ExportFormat } from "@/lib/exportConfig";

interface StudentExportHistoryProps {
  /** Match by `studentId` (admission/roll) OR by displayed name. */
  studentId: string;
  studentName?: string;
  /** Optional cap; default 20 most recent. */
  limit?: number;
}

const FORMAT_ICON: Record<ExportFormat, typeof FileText> = {
  csv: FileSpreadsheet,
  pdf: FileText,
  htmlFallback: FileCode2,
};

const FORMAT_LABEL: Record<ExportFormat, string> = {
  csv: "CSV",
  pdf: "PDF",
  htmlFallback: "HTML",
};

function statusFor(entry: ExportAuditEntry) {
  if (entry.fallback) {
    return {
      label: "HTML fallback",
      tone: "warning" as const,
      Icon: AlertTriangle,
      hint: "PDF generation failed; HTML report was downloaded instead.",
    };
  }
  return {
    label: "Success",
    tone: "success" as const,
    Icon: CheckCircle2,
    hint: "Downloaded successfully.",
  };
}

export default function StudentExportHistory({
  studentId,
  studentName,
  limit = 20,
}: StudentExportHistoryProps) {
  const [entries, setEntries] = useState<ExportAuditEntry[]>(() => filter(auditLogStore.list()));

  function filter(all: ExportAuditEntry[]): ExportAuditEntry[] {
    return all
      .filter((e) =>
        e.studentId === studentId ||
        (studentName && e.studentName?.toLowerCase() === studentName.toLowerCase()),
      )
      .slice(0, limit);
  }

  useEffect(() => {
    setEntries(filter(auditLogStore.list()));
    return auditLogStore.subscribe(() => setEntries(filter(auditLogStore.list())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, studentName, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Export history
        </CardTitle>
        <CardDescription>
          Recent CSV / PDF / HTML downloads for this student, with format, date range
          and status. Sourced from the export audit log.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No exports yet. Generated reports will appear here.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border/60 pl-6">
            {entries.map((e) => {
              const Icon = FORMAT_ICON[e.format];
              const status = statusFor(e);
              const StatusIcon = status.Icon;
              return (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {FORMAT_LABEL[e.format]} export
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {e.role}
                      </Badge>
                      <Badge
                        variant={status.tone === "warning" ? "secondary" : "outline"}
                        className={
                          status.tone === "warning"
                            ? "gap-1 bg-warning/10 text-warning border-warning/20"
                            : "gap-1 bg-success/10 text-success border-success/20"
                        }
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground" dateTime={e.timestamp}>
                      {format(parseISO(e.timestamp), "MMM dd, yyyy • HH:mm")}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {status.hint} Route: <code className="font-mono">{e.route || "—"}</code>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
