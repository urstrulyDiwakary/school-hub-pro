/**
 * Admin-tunable settings for the export subsystem.
 *
 * Today these are persisted in localStorage; the same adapter shape is used
 * by `exportConfig.ts` so we can swap to Lovable Cloud later without
 * touching consumers.
 */

const STORAGE_KEY = "export-settings:v1";
const CHANGE_EVENT = "export-settings-updated";

export interface ExportSettings {
  /** Default cap on automatic retries for failed export jobs. */
  defaultMaxRetries: number;
  /**
   * Max number of failed export jobs that can be waiting on an auto-retry
   * timer at the same time. Extra jobs queue until a slot frees up. 0 = no
   * cap (any number can wait concurrently).
   */
  maxConcurrentAutoRetries: number;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  defaultMaxRetries: 3,
  maxConcurrentAutoRetries: 2,
};

function safeParse(raw: string | null): ExportSettings | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<ExportSettings>;
    const n = Number(p.defaultMaxRetries);
    if (!Number.isFinite(n) || n < 0 || n > 20) return null;
    const c = Number(p.maxConcurrentAutoRetries);
    const concurrent = Number.isFinite(c) && c >= 0 && c <= 20
      ? Math.floor(c)
      : DEFAULT_EXPORT_SETTINGS.maxConcurrentAutoRetries;
    return { defaultMaxRetries: Math.floor(n), maxConcurrentAutoRetries: concurrent };
  } catch {
    return null;
  }
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
