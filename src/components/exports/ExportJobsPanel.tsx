/**
 * Global toaster-style panel showing active and recent export jobs.
 *
 * Renders fixed bottom-right with a stack of cards (collapsible). Each card
 * shows label, status, progress bar, sub-step, and a Cancel button while
 * running or a Dismiss button once finished. Persists across route changes
 * because it's mounted at the App root.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X, Loader2, CheckCircle2, AlertCircle, Ban, FileText, FileSpreadsheet, FileCode2, Files, RotateCcw, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useExportJobs } from "@/hooks/useExportJobs";
import { exportJobQueue, type ExportJob, type ExportJobKind } from "@/lib/exportJobQueue";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const KIND_ICON: Record<ExportJobKind, typeof FileText> = {
  csv: FileSpreadsheet,
  pdf: FileText,
  htmlFallback: FileCode2,
  "combined-pdf": Files,
};

const KIND_LABEL: Record<ExportJobKind, string> = {
  csv: "CSV",
  pdf: "PDF",
  htmlFallback: "HTML",
  "combined-pdf": "Combined PDF",
};

function formatDuration(job: ExportJob): string {
  const end = job.finishedAt ?? Date.now();
  const ms = Math.max(0, end - job.startedAt);
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

function StatusIcon({ job }: { job: ExportJob }) {
  if (job.status === "running" || job.status === "queued") {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  }
  if (job.status === "succeeded") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (job.status === "failed") return <AlertCircle className="h-4 w-4 text-destructive" />;
  return <Ban className="h-4 w-4 text-muted-foreground" />;
}

function formatTimestamp(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

function JobCard({ job }: { job: ExportJob }) {
  const KindIcon = KIND_ICON[job.kind];
  const isActive = job.status === "running" || job.status === "queued";
  const isFailedOrCancelled = job.status === "failed" || job.status === "cancelled";
  const retries = job.retries ?? 0;
  const maxRetries = job.maxRetries ?? 0;
  const retriesExhausted = retries >= maxRetries;
  const canRetry = isFailedOrCancelled && job.retryable !== false && !retriesExhausted;
  const progressPct = Math.round(job.progress * 100);
  const showFailureDetail = job.status === "failed" && (job.firstError || job.lastError);

  return (
    <div className="rounded-lg border bg-card p-3 shadow-md">
      <div className="flex items-start gap-2">
        <KindIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate">{job.label}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {KIND_LABEL[job.kind]}
            </Badge>
            {retries > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                Retry {retries}/{maxRetries}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusIcon job={job} />
            <span className="truncate">
              {job.status === "queued" && (job.nextRetryAt
                ? `Retrying in ${Math.max(0, Math.ceil((job.nextRetryAt - Date.now()) / 1000))}s`
                : "Queued")}
              {job.status === "running" && (job.step ?? "Working…")}
              {job.status === "succeeded" && `Done in ${formatDuration(job)}`}
              {job.status === "failed" && (job.error ?? "Failed")}
              {job.status === "cancelled" && "Cancelled"}
            </span>
          </div>
          {showFailureDetail && (
            <div className="mt-1.5 rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-[11px] leading-snug">
              {job.firstError && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Original failure:</span>{" "}
                  {job.firstError}
                  {job.firstFailedAt ? ` (${formatTimestamp(job.firstFailedAt)})` : ""}
                </div>
              )}
              {job.lastFailedAt && retries > 0 && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Last failure:</span>{" "}
                  {formatTimestamp(job.lastFailedAt)}
                </div>
              )}
              {retriesExhausted && (
                <div className="text-destructive font-medium">
                  Retry limit reached ({maxRetries}).
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 -mr-1 -mt-1">
          {isFailedOrCancelled && job.retryable !== false && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => exportJobQueue.retry(job.id)}
              aria-label="Retry export"
              title={canRetry ? "Retry with same parameters" : `Retry limit reached (${maxRetries})`}
              disabled={!canRetry}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              if (isActive) exportJobQueue.cancel(job.id);
              else exportJobQueue.clear(job.id);
            }}
            aria-label={isActive ? "Cancel export" : "Dismiss"}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {isActive && (
        <Progress value={progressPct} className="mt-2 h-1.5" />
      )}
    </div>
  );
}

export default function ExportJobsPanel() {
  const jobs = useExportJobs();
  const [collapsed, setCollapsed] = useState(false);

  const { active, recent } = useMemo(() => {
    const active = jobs.filter((j) => j.status === "running" || j.status === "queued");
    const recent = jobs
      .filter((j) => j.status !== "running" && j.status !== "queued")
      .slice(-3);
    return { active, recent };
  }, [jobs]);

  if (jobs.length === 0) return null;

  const totalActive = active.length;
  const visible = collapsed ? [] : [...active, ...recent];

  return (
    <div
      className={cn(
        "fixed z-50 bottom-4 right-4 w-[320px] max-w-[calc(100vw-2rem)]",
        "flex flex-col gap-2",
      )}
      role="region"
      aria-label="Export jobs"
    >
      <div className="flex items-center justify-between rounded-lg border bg-background/95 backdrop-blur px-3 py-2 shadow-md">
        <div className="flex items-center gap-2 text-sm font-medium">
          {totalActive > 0 ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span>
            {totalActive > 0
              ? `${totalActive} export${totalActive === 1 ? "" : "s"} in progress`
              : `${recent.length} recent export${recent.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {recent.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => exportJobQueue.clearFinished()}
            >
              Clear
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand jobs panel" : "Collapse jobs panel"}
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      {visible.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
