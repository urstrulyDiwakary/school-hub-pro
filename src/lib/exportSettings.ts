/**
 * Admin-tunable settings for the export subsystem.
 *
 * Today these are persisted in localStorage; the same adapter shape is used
 * by `exportConfig.ts` so we can swap to Lovable Cloud later without
 * touching consumers.
 */

type ExportJobKind = "csv" | "pdf" | "htmlFallback" | "combined-pdf";

const STORAGE_KEY = "export-settings:v1";
const CHANGE_EVENT = "export-settings-updated";

export interface ExportSettings {
  /** Default cap on automatic retries for failed export jobs. */
  defaultMaxRetries: number;
  /**
   * Global fallback for max concurrent auto-retry timers across all kinds.
   * 0 = no cap.
   */
  maxConcurrentAutoRetries: number;
  /**
   * Per-kind override for max concurrent auto-retry timers. When a kind is
   * omitted, the global `maxConcurrentAutoRetries` value applies. A value of
   * 0 means "no cap for this kind". Values are clamped to [0, 20].
   */
  maxConcurrentAutoRetriesByKind?: Partial<Record<ExportJobKind, number>>;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  defaultMaxRetries: 3,
  maxConcurrentAutoRetries: 2,
  maxConcurrentAutoRetriesByKind: {},
};

const KNOWN_KINDS: ExportJobKind[] = ["csv", "pdf", "htmlFallback", "combined-pdf"];

function clampConcurrent(n: unknown): number | null {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0 || v > 20) return null;
  return Math.floor(v);
}

function safeParse(raw: string | null): ExportSettings | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<ExportSettings>;
    const n = Number(p.defaultMaxRetries);
    if (!Number.isFinite(n) || n < 0 || n > 20) return null;
    const c = clampConcurrent(p.maxConcurrentAutoRetries);
    const concurrent = c ?? DEFAULT_EXPORT_SETTINGS.maxConcurrentAutoRetries;
    const byKind: Partial<Record<ExportJobKind, number>> = {};
    if (p.maxConcurrentAutoRetriesByKind && typeof p.maxConcurrentAutoRetriesByKind === "object") {
      for (const k of KNOWN_KINDS) {
        const v = clampConcurrent((p.maxConcurrentAutoRetriesByKind as Record<string, unknown>)[k]);
        if (v !== null) byKind[k] = v;
      }
    }
    return {
      defaultMaxRetries: Math.floor(n),
      maxConcurrentAutoRetries: concurrent,
      maxConcurrentAutoRetriesByKind: byKind,
    };
  } catch {
    return null;
  }
}

/** Resolve the effective concurrent-retry cap for a given kind. */
export function resolveConcurrentCap(settings: ExportSettings, kind: ExportJobKind): number {
  const perKind = settings.maxConcurrentAutoRetriesByKind?.[kind];
  if (perKind !== undefined) return perKind;
  return settings.maxConcurrentAutoRetries;
}

export const exportSettingsStore = {
  get(): ExportSettings {
    if (typeof window === "undefined") return DEFAULT_EXPORT_SETTINGS;
    return safeParse(window.localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_EXPORT_SETTINGS;
  },
  set(next: ExportSettings) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  },
  reset() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  },
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(CHANGE_EVENT, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(CHANGE_EVENT, cb);
      window.removeEventListener("storage", cb);
    };
  },
};
