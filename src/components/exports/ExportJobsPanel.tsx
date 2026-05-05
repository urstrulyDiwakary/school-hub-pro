/**
 * Global toaster-style panel showing active and recent export jobs.
 *
 * Renders fixed bottom-right with a stack of cards (collapsible). Each card
 * shows label, status, progress bar, sub-step, and a Cancel button while
 * running or a Dismiss button once finished. Persists across route changes
 * because it's mounted at the App root.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X, Loader2, CheckCircle2, AlertCircle, Ban, FileText, FileSpreadsheet, FileCode2, Files, RotateCcw, Copy, Check, RefreshCw, Filter, Download, Trash2, Search, FlaskConical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useExportJobs } from "@/hooks/useExportJobs";
import { exportJobQueue, explainIneligibility, INELIGIBILITY_LABEL, type ExportJob, type ExportJobKind } from "@/lib/exportJobQueue";
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

function buildErrorClipboardText(job: ExportJob): string {
  const lines: string[] = [
    `Export job: ${job.label}`,
    `Format: ${KIND_LABEL[job.kind]}`,
    `Job ID: ${job.id}`,
  ];
  if (job.firstError) {
    lines.push(
      `Original failure: ${job.firstError}` +
        (job.firstFailedAt ? ` (${new Date(job.firstFailedAt).toISOString()})` : ""),
    );
  }
  if (job.lastError && job.lastError !== job.firstError) {
    lines.push(
      `Last failure: ${job.lastError}` +
        (job.lastFailedAt ? ` (${new Date(job.lastFailedAt).toISOString()})` : ""),
    );
  } else if (job.lastFailedAt && (job.retries ?? 0) > 0) {
    lines.push(`Last failure at: ${new Date(job.lastFailedAt).toISOString()}`);
  }
  lines.push(`Retries: ${job.retries ?? 0}/${job.maxRetries ?? 0}`);
  return lines.join("\n");
}

function downloadErrorReport(job: ExportJob) {
  const report = {
    jobId: job.id,
    label: job.label,
    kind: job.kind,
    format: KIND_LABEL[job.kind],
    status: job.status,
    retries: job.retries ?? 0,
    maxRetries: job.maxRetries ?? 0,
    startedAt: new Date(job.startedAt).toISOString(),
    finishedAt: job.finishedAt ? new Date(job.finishedAt).toISOString() : null,
    firstError: job.firstError ?? null,
    firstFailedAt: job.firstFailedAt ? new Date(job.firstFailedAt).toISOString() : null,
    lastError: job.lastError ?? null,
    lastFailedAt: job.lastFailedAt ? new Date(job.lastFailedAt).toISOString() : null,
    nextRetryAt: job.nextRetryAt ? new Date(job.nextRetryAt).toISOString() : null,
    requestParams: job.requestParams ?? null,
    appVersion:
      (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.VITE_APP_VERSION) ||
      "dev",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    generatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-error-${job.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success("Error report downloaded");
}

function JobCard({ job, now }: { job: ExportJob; now: number }) {
  const KindIcon = KIND_ICON[job.kind];
  const isActive = job.status === "running" || job.status === "queued";
  const isFailedOrCancelled = job.status === "failed" || job.status === "cancelled";
  const retries = job.retries ?? 0;
  const maxRetries = job.maxRetries ?? 0;
  const retriesExhausted = retries >= maxRetries;
  const canRetry = isFailedOrCancelled && job.retryable !== false && !retriesExhausted;
  const progressPct = Math.round(job.progress * 100);
  const showFailureDetail = job.status === "failed" && (job.firstError || job.lastError);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = buildErrorClipboardText(job);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("Error details copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  // Next-retry countdown details (computed against the live `now` tick).
  const nextRetrySecs = job.nextRetryAt
    ? Math.max(0, Math.ceil((job.nextRetryAt - now) / 1000))
    : null;
  const backoffMs = job.nextRetryAt && job.lastFailedAt
    ? job.nextRetryAt - job.lastFailedAt
    : null;

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
              {job.status === "queued" && (nextRetrySecs !== null
                ? `Auto-retry in ${nextRetrySecs}s`
                : "Queued")}
              {job.status === "running" && (job.step ?? "Working…")}
              {job.status === "succeeded" && `Done in ${formatDuration(job)}`}
              {job.status === "failed" && (job.error ?? "Failed")}
              {job.status === "cancelled" && "Cancelled"}
            </span>
          </div>
          {job.status === "queued" && job.nextRetryAt && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              Next attempt at <span className="font-medium text-foreground">{formatTimestamp(job.nextRetryAt)}</span>
              {backoffMs !== null && (
                <> · backoff {(backoffMs / 1000).toFixed(1)}s (with jitter)</>
              )}
            </div>
          )}
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
          {job.status === "failed" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              aria-label="Copy error details"
              title="Copy failure reason and timestamps for support"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          )}
          {job.status === "failed" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => downloadErrorReport(job)}
              aria-label="Download error report"
              title="Download failure details as JSON for support"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
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

const ALL_KINDS: ExportJobKind[] = ["csv", "pdf", "htmlFallback", "combined-pdf"];

export default function ExportJobsPanel() {
  const jobs = useExportJobs();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [kindFilter, setKindFilter] = useState<Set<ExportJobKind>>(() => new Set(ALL_KINDS));
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Tick once a second so countdowns ("Auto-retry in 4s") stay accurate.
  // Only run while there's a pending nextRetryAt to keep this cheap.
  const hasPendingRetry = jobs.some((j) => j.status === "queued" && j.nextRetryAt);
  useEffect(() => {
    if (!hasPendingRetry) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasPendingRetry]);

  const isFailedEligible = (j: ExportJob) =>
    j.status === "failed" &&
    j.retryable !== false &&
    (j.retries ?? 0) < (j.maxRetries ?? 0);

  const matchesSearch = (j: ExportJob, q: string) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      j.label.toLowerCase().includes(needle) ||
      j.kind.toLowerCase().includes(needle) ||
      KIND_LABEL[j.kind].toLowerCase().includes(needle) ||
      (j.error?.toLowerCase().includes(needle) ?? false) ||
      (j.firstError?.toLowerCase().includes(needle) ?? false) ||
      (j.lastError?.toLowerCase().includes(needle) ?? false)
    );
  };

  const passesFilters = (j: ExportJob) => {
    if (!kindFilter.has(j.kind)) return false;
    if (eligibleOnly && !isFailedEligible(j)) return false;
    if (!matchesSearch(j, search.trim())) return false;
    return true;
  };

  const filtersActive = eligibleOnly || kindFilter.size !== ALL_KINDS.length || search.trim() !== "";

  const { active, recent, eligibleFailedCount, hiddenCount } = useMemo(() => {
    const filtered = jobs.filter(passesFilters);
    const active = filtered.filter((j) => j.status === "running" || j.status === "queued");
    const recent = filtered
      .filter((j) => j.status !== "running" && j.status !== "queued")
      .slice(-5);
    const eligibleFailedCount = jobs.filter(isFailedEligible).length;
    const hiddenCount = jobs.length - filtered.length;
    return { active, recent, eligibleFailedCount, hiddenCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, eligibleOnly, kindFilter, search]);

  // Per-job ineligibility breakdown — drives the filter tooltip and informs
  // users why their failed job isn't being retried.
  const ineligibilityBreakdown = useMemo(() => {
    const breakdown = {
      "not-failed": 0,
      "not-retryable": 0,
      "max-retries-reached": 0,
      "kind-excluded": 0,
    };
    for (const j of jobs) {
      const reason = explainIneligibility(j, { allowedKinds: kindFilter });
      if (reason !== "ok" && reason in breakdown) {
        breakdown[reason as keyof typeof breakdown] += 1;
      }
    }
    return breakdown;
  }, [jobs, kindFilter]);

  if (jobs.length === 0) return null;

  const totalActive = active.length;
  const visible = collapsed ? [] : [...active, ...recent];

  const toggleKind = (k: ExportJobKind) => {
    setKindFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      // Never allow an empty set — that would hide everything silently.
      if (next.size === 0) return prev;
      return next;
    });
  };

  const handleRetryAll = () => {
    const n = exportJobQueue.retryAllFailed();
    if (n > 0) toast.success(`Retrying ${n} failed export${n === 1 ? "" : "s"}`);
    else toast.info("No eligible failed exports to retry");
  };

  const handleSimulateRetry = () => {
    const plan = exportJobQueue.simulateRetryAll();
    if (plan.length === 0) {
      toast.info("Simulate retry: no eligible failed exports", {
        description: "All failed jobs are non-retryable or have hit their max-retry cap.",
      });
      return;
    }
    const summary = plan
      .slice(0, 5)
      .map((p) => {
        const secs = Math.max(0, Math.round(p.estimatedDelayMs / 100) / 10);
        return `• ${p.label} — attempt ${p.nextAttempt}/${p.maxRetries} in ~${secs}s`;
      })
      .join("\n");
    const more = plan.length > 5 ? `\n…and ${plan.length - 5} more` : "";
    toast(`Would retry ${plan.length} export${plan.length === 1 ? "" : "s"}`, {
      description: `${summary}${more}`,
      duration: 8000,
    });
  };

  const handleClearHistory = () => {
    exportJobQueue.clearPersistedFailedHistory();
    toast.success("Failed export history cleared");
  };

  const hasFailedJobs = jobs.some((j) => j.status === "failed");
  const totalIneligible =
    ineligibilityBreakdown["not-retryable"] +
    ineligibilityBreakdown["max-retries-reached"] +
    ineligibilityBreakdown["kind-excluded"];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "fixed z-50 bottom-4 right-4 w-[340px] max-w-[calc(100vw-2rem)]",
          "flex flex-col gap-2",
        )}
        role="region"
        aria-label="Export jobs"
      >
        <div className="rounded-lg border bg-background/95 backdrop-blur shadow-md">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium min-w-0">
              {totalActive > 0 ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              )}
              <span className="truncate">
                {totalActive > 0
                  ? `${totalActive} export${totalActive === 1 ? "" : "s"} in progress`
                  : `${recent.length} recent export${recent.length === 1 ? "" : "s"}`}
                {hiddenCount > 0 && (
                  <span className="ml-1 text-muted-foreground font-normal">· {hiddenCount} hidden</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", search.trim() && "text-primary")}
                    onClick={() => setSearchOpen((v) => !v)}
                    aria-label="Search jobs"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search by label, format, or error text</TooltipContent>
              </Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", filtersActive && "text-primary")}
                    aria-label="Filter jobs"
                    title="Filter jobs"
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium">Show</p>
                      {totalIneligible > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Why are some failed jobs not retry-eligible?"
                            >
                              <Info className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[260px] text-xs">
                            <p className="font-medium mb-1">Why some jobs aren't retry-eligible:</p>
                            <ul className="space-y-0.5">
                              {ineligibilityBreakdown["max-retries-reached"] > 0 && (
                                <li>
                                  • {ineligibilityBreakdown["max-retries-reached"]} —{" "}
                                  {INELIGIBILITY_LABEL["max-retries-reached"]}
                                </li>
                              )}
                              {ineligibilityBreakdown["not-retryable"] > 0 && (
                                <li>
                                  • {ineligibilityBreakdown["not-retryable"]} —{" "}
                                  {INELIGIBILITY_LABEL["not-retryable"]}
                                </li>
                              )}
                              {ineligibilityBreakdown["kind-excluded"] > 0 && (
                                <li>
                                  • {ineligibilityBreakdown["kind-excluded"]} —{" "}
                                  {INELIGIBILITY_LABEL["kind-excluded"]}
                                </li>
                              )}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={eligibleOnly}
                        onCheckedChange={(v) => setEligibleOnly(v === true)}
                      />
                      <span>Only retry-eligible failed jobs</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Format</p>
                    <div className="space-y-1.5">
                      {ALL_KINDS.map((k) => (
                        <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox
                            checked={kindFilter.has(k)}
                            onCheckedChange={() => toggleKind(k)}
                          />
                          <span>{KIND_LABEL[k]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {filtersActive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full text-xs"
                      onClick={() => {
                        setEligibleOnly(false);
                        setKindFilter(new Set(ALL_KINDS));
                        setSearch("");
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
              {hasFailedJobs && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleSimulateRetry}
                      aria-label="Simulate retry"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview which jobs would retry (no changes made)</TooltipContent>
                </Tooltip>
              )}
              {eligibleFailedCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                  onClick={handleRetryAll}
                  title={`Retry ${eligibleFailedCount} failed export${eligibleFailedCount === 1 ? "" : "s"}`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry failed ({eligibleFailedCount})
                </Button>
              )}
              {hasFailedJobs && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleClearHistory}
                  aria-label="Clear failed history"
                  title="Clear persisted failed export history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
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
          {(searchOpen || search.trim()) && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search label, format, or error…"
                  className="h-7 pl-7 pr-7 text-xs"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {visible.map((job) => (
          <JobCard key={job.id} job={job} now={now} />
        ))}
        {!collapsed && visible.length === 0 && filtersActive && (
          <div className="rounded-lg border bg-card px-3 py-4 text-center text-xs text-muted-foreground shadow-md">
            No jobs match the current filters.
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
