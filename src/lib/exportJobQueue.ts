/**
 * Export job queue.
 *
 * Long-running exports (large date ranges, combined multi-student PDFs) used
 * to block the main thread and could hit the 15s hard timeout in
 * StudentExportActions. The queue moves that work into the background:
 *
 *  - Pure data work (CSV string building, HTML template rendering) runs
 *    inside a real Web Worker (`exportWorker.ts`).
 *  - DOM-bound work (jsPDF, blob download) runs on the main thread but is
 *    split into yielding chunks so the UI stays interactive and progress
 *    updates flow back to the global jobs panel.
 *
 * The queue itself is a small pub/sub store — UI subscribes via
 * `useExportJobs` and the global `<ExportJobsPanel />` renders progress
 * toasters. Jobs are kept in memory only; refresh clears them.
 */

import type { AttendanceStatus } from "@/data/teacherData";

export type ExportJobKind = "csv" | "pdf" | "htmlFallback" | "combined-pdf";
export type ExportJobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface ExportJob {
  id: string;
  kind: ExportJobKind;
  /** Short label shown in the jobs panel, e.g. "Aarav Sharma — PDF". */
  label: string;
  status: ExportJobStatus;
  /** 0..1 progress reported by the runner. */
  progress: number;
  /** Optional sub-status, e.g. "Rendering page 4 of 12". */
  step?: string;
  startedAt: number;
  finishedAt?: number;
  error?: string;
  /** Result file size in bytes when succeeded. */
  bytes?: number;
}

export type JobRunner = (
  ctx: {
    /** Report progress 0..1 and an optional step label. */
    report: (progress: number, step?: string) => void;
    /** Throw early if the user cancelled. */
    throwIfCancelled: () => void;
  },
) => Promise<{ bytes?: number } | void>;

interface QueuedItem {
  job: ExportJob;
  runner: JobRunner;
  cancelled: boolean;
  /** Whether this job can be retried after failure (true unless the runner is single-use). */
  retryable: boolean;
}

type Listener = (jobs: ExportJob[]) => void;

class ExportJobQueueImpl {
  private items: QueuedItem[] = [];
  private listeners = new Set<Listener>();
  private running = false;

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    cb(this.snapshot());
    return () => { this.listeners.delete(cb); };
  }

  snapshot(): ExportJob[] {
    return this.items.map((i) => ({ ...i.job }));
  }

  private notify() {
    const snap = this.snapshot();
    this.listeners.forEach((cb) => cb(snap));
  }

  enqueue(kind: ExportJobKind, label: string, runner: JobRunner): string {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    this.items.push({
      job: {
        id, kind, label,
        status: "queued",
        progress: 0,
        startedAt: Date.now(),
      },
      runner,
      cancelled: false,
    });
    this.notify();
    void this.tick();
    return id;
  }

  cancel(id: string) {
    const item = this.items.find((i) => i.job.id === id);
    if (!item) return;
    if (item.job.status === "queued") {
      item.job.status = "cancelled";
      item.job.finishedAt = Date.now();
    } else if (item.job.status === "running") {
      item.cancelled = true;
    }
    this.notify();
  }

  clear(id: string) {
    this.items = this.items.filter((i) => i.job.id !== id);
    this.notify();
  }

  clearFinished() {
    this.items = this.items.filter((i) => i.job.status === "running" || i.job.status === "queued");
    this.notify();
  }

  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      while (true) {
        const next = this.items.find((i) => i.job.status === "queued");
        if (!next) break;
        next.job.status = "running";
        next.job.progress = 0;
        this.notify();
        try {
          const result = await next.runner({
            report: (p, step) => {
              next.job.progress = Math.max(0, Math.min(1, p));
              if (step !== undefined) next.job.step = step;
              this.notify();
            },
            throwIfCancelled: () => {
              if (next.cancelled) throw new Error("Cancelled by user");
            },
          });
          if (next.cancelled) {
            next.job.status = "cancelled";
          } else {
            next.job.status = "succeeded";
            next.job.progress = 1;
            next.job.bytes = result && typeof result === "object" ? result.bytes : undefined;
          }
        } catch (err) {
          next.job.status = next.cancelled ? "cancelled" : "failed";
          next.job.error = err instanceof Error ? err.message : String(err);
        } finally {
          next.job.finishedAt = Date.now();
          this.notify();
        }
      }
    } finally {
      this.running = false;
    }
  }
}

export const exportJobQueue = new ExportJobQueueImpl();

/** Yield control to the event loop so the UI can paint between work chunks. */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback?.(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/** Helper to bridge fixed work into report() updates. */
export function chunkProgress(done: number, total: number, base = 0, span = 1): number {
  if (total <= 0) return base;
  return base + Math.min(1, done / total) * span;
}

// Re-export for convenience in tests.
export type { AttendanceStatus };
