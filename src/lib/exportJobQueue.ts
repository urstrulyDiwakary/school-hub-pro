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
import { exportSettingsStore } from "./exportSettings";

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
  /** Whether the queue can re-run this job (re-enqueue with the same runner). */
  retryable?: boolean;
  /** Number of times this job has been retried. */
  retries?: number;
  /** Maximum number of retry attempts allowed for this job. */
  maxRetries?: number;
  /** The very first failure reason for this job (preserved across retries). */
  firstError?: string;
  /** Timestamp of the first failure. */
  firstFailedAt?: number;
  /** The most recent failure reason (cleared only when the job succeeds). */
  lastError?: string;
  /** Timestamp of the most recent failure. */
  lastFailedAt?: number;
  /** When set, an auto-retry is scheduled to run at this timestamp (epoch ms). */
  nextRetryAt?: number;
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
  /** Maximum retry attempts before giving up. */
  maxRetries: number;
  /** Pending auto-retry timer, if any. */
  retryTimer?: ReturnType<typeof setTimeout>;
}

/** Default cap on automatic retries. Manual retries beyond this are blocked too. */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Compute exponential backoff delay (ms) for the Nth retry attempt.
 * attempt is 1-indexed: 1 => ~1s, 2 => ~2s, 3 => ~4s, capped at 30s.
 * A small jitter avoids thundering herd if many jobs fail simultaneously.
 */
export function computeBackoffMs(attempt: number, baseMs = 1000, capMs = 30_000): number {
  const exp = Math.min(capMs, baseMs * Math.pow(2, Math.max(0, attempt - 1)));
  const jitter = Math.random() * 0.25 * exp;
  return Math.round(exp + jitter);
}

type Listener = (jobs: ExportJob[]) => void;

/** localStorage key for persisted failed-job history (survives refresh). */
const FAILED_HISTORY_KEY = "export-failed-history:v1";
const MAX_PERSISTED_FAILURES = 25;

class ExportJobQueueImpl {
  private items: QueuedItem[] = [];
  private listeners = new Set<Listener>();
  private running = false;
  /** Per-instance override; falls back to the persisted admin setting. */
  private defaultMaxRetriesOverride: number | null = null;
  private restored = false;

  /** Set the global default max-retry cap (admin-configurable). */
  setDefaultMaxRetries(n: number) {
    this.defaultMaxRetriesOverride = Math.max(0, Math.floor(n));
  }
  getDefaultMaxRetries(): number {
    if (this.defaultMaxRetriesOverride !== null) return this.defaultMaxRetriesOverride;
    return exportSettingsStore.get().defaultMaxRetries;
  }

  /**
   * Restore failed-job history from localStorage. Restored jobs are NOT
   * re-runnable (their runner closure is gone) but remain visible so users
   * can see what failed and copy the error context for support.
   */
  restoreFromStorage() {
    if (this.restored || typeof window === "undefined") return;
    this.restored = true;
    try {
      const raw = window.localStorage.getItem(FAILED_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ExportJob[];
      if (!Array.isArray(parsed)) return;
      for (const job of parsed) {
        // Restored jobs cannot be retried — runner closure is lost on reload.
        const restored: ExportJob = { ...job, status: "failed", retryable: false };
        this.items.push({
          job: restored,
          runner: async () => { throw new Error("Cannot retry — page was reloaded after this failure"); },
          cancelled: false,
          retryable: false,
          maxRetries: job.maxRetries ?? 0,
        });
      }
      this.notify();
    } catch {
      // Corrupted history is non-fatal.
    }
  }

  private persistFailedHistory() {
    if (typeof window === "undefined") return;
    const failed = this.items
      .filter((i) => i.job.status === "failed")
      .slice(-MAX_PERSISTED_FAILURES)
      .map((i) => ({ ...i.job }));
    try {
      window.localStorage.setItem(FAILED_HISTORY_KEY, JSON.stringify(failed));
    } catch {
      // Quota errors are non-fatal.
    }
  }

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
    this.persistFailedHistory();
  }

  enqueue(
    kind: ExportJobKind,
    label: string,
    runner: JobRunner,
    opts?: { retryable?: boolean; maxRetries?: number },
  ): string {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const retryable = opts?.retryable !== false;
    const maxRetries = Math.max(0, Math.floor(opts?.maxRetries ?? this.getDefaultMaxRetries()));
    this.items.push({
      job: {
        id, kind, label,
        status: "queued",
        progress: 0,
        startedAt: Date.now(),
        retryable,
        retries: 0,
        maxRetries,
      },
      runner,
      cancelled: false,
      retryable,
      maxRetries,
    });
    this.notify();
    void this.tick();
    return id;
  }

  /** Whether the job can be retried again (manually or automatically). */
  canRetry(id: string): boolean {
    const item = this.items.find((i) => i.job.id === id);
    if (!item || !item.retryable) return false;
    if (item.job.status !== "failed" && item.job.status !== "cancelled") return false;
    return (item.job.retries ?? 0) < item.maxRetries;
  }

  /**
   * Re-run a failed (or cancelled) job using the SAME runner closure, which
   * captured the original parameters and template snapshot at enqueue time.
   * The job is reset in place — same id, incremented retries counter — so the
   * UI keeps a stable card and history. Preserves firstError/lastError so the
   * panel can show the original failure reason and last failure timestamp.
   */
  retry(id: string): boolean {
    const item = this.items.find((i) => i.job.id === id);
    if (!item) return false;
    if (!item.retryable) return false;
    if (item.job.status !== "failed" && item.job.status !== "cancelled") return false;
    if ((item.job.retries ?? 0) >= item.maxRetries) return false;
    if (item.retryTimer) {
      clearTimeout(item.retryTimer);
      item.retryTimer = undefined;
    }
    item.cancelled = false;
    item.job.status = "queued";
    item.job.progress = 0;
    item.job.error = undefined;
    item.job.step = undefined;
    item.job.finishedAt = undefined;
    item.job.nextRetryAt = undefined;
    item.job.startedAt = Date.now();
    item.job.retries = (item.job.retries ?? 0) + 1;
    this.notify();
    void this.tick();
  }

  /**
   * Retry every failed job that is still eligible (retryable + under cap).
   * Returns the number of jobs that were re-enqueued.
   */
  retryAllFailed(): number {
    let count = 0;
    for (const item of this.items) {
      if (this.canRetry(item.job.id) && this.retry(item.job.id)) count += 1;
    }
    return count;
  }

  cancel(id: string) {
    const item = this.items.find((i) => i.job.id === id);
    if (!item) return;
    if (item.retryTimer) {
      clearTimeout(item.retryTimer);
      item.retryTimer = undefined;
      item.job.nextRetryAt = undefined;
    }
    if (item.job.status === "queued") {
      item.job.status = "cancelled";
      item.job.finishedAt = Date.now();
    } else if (item.job.status === "running") {
      item.cancelled = true;
    }
    this.notify();
  }

  clear(id: string) {
    const item = this.items.find((i) => i.job.id === id);
    if (item?.retryTimer) clearTimeout(item.retryTimer);
    this.items = this.items.filter((i) => i.job.id !== id);
    this.notify();
  }

  clearFinished() {
    this.items = this.items.filter((i) => {
      const keep = i.job.status === "running" || i.job.status === "queued";
      if (!keep && i.retryTimer) clearTimeout(i.retryTimer);
      return keep;
    });
    this.notify();
  }

  /** Pending auto-retry items waiting for a free concurrency slot. */
  private autoRetryWaitQueue: QueuedItem[] = [];

  private currentAutoRetrySlots(): number {
    return this.items.filter((i) => i.retryTimer !== undefined).length;
  }

  private scheduleAutoRetry(item: QueuedItem) {
    if (!item.retryable) return;
    const attempt = (item.job.retries ?? 0) + 1;
    if (attempt > item.maxRetries) return;
    const cap = exportSettingsStore.get().maxConcurrentAutoRetries;
    if (cap > 0 && this.currentAutoRetrySlots() >= cap) {
      // Defer: another auto-retry is already pending. Try again when one frees up.
      if (!this.autoRetryWaitQueue.includes(item)) this.autoRetryWaitQueue.push(item);
      return;
    }
    const delay = computeBackoffMs(attempt);
    item.job.nextRetryAt = Date.now() + delay;
    this.notify();
    item.retryTimer = setTimeout(() => {
      item.retryTimer = undefined;
      // Only auto-retry if still in failed state and not user-cleared.
      if (item.job.status === "failed") this.retry(item.job.id);
      this.drainAutoRetryWaitQueue();
    }, delay);
  }

  private drainAutoRetryWaitQueue() {
    const cap = exportSettingsStore.get().maxConcurrentAutoRetries;
    while (this.autoRetryWaitQueue.length > 0) {
      if (cap > 0 && this.currentAutoRetrySlots() >= cap) break;
      const next = this.autoRetryWaitQueue.shift();
      if (!next || next.job.status !== "failed") continue;
      if ((next.job.retries ?? 0) >= next.maxRetries) continue;
      this.scheduleAutoRetry(next);
    }
  }

  /** Clear persisted failed history from localStorage and remove restored failed jobs from view. */
  clearPersistedFailedHistory() {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(FAILED_HISTORY_KEY); } catch { /* noop */ }
    }
    // Also remove failed items currently in the queue so the panel reflects the wipe.
    this.items = this.items.filter((i) => i.job.status !== "failed");
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
            // Successful run clears the lingering error context.
            next.job.error = undefined;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          next.job.status = next.cancelled ? "cancelled" : "failed";
          next.job.error = message;
          if (next.job.status === "failed") {
            const now = Date.now();
            next.job.lastError = message;
            next.job.lastFailedAt = now;
            if (next.job.firstError === undefined) {
              next.job.firstError = message;
              next.job.firstFailedAt = now;
            }
          }
        } finally {
          next.job.finishedAt = Date.now();
          this.notify();
          if (next.job.status === "failed" && (next.job.retries ?? 0) < next.maxRetries) {
            this.scheduleAutoRetry(next);
          }
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
