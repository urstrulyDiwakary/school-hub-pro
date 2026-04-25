/**
 * Per-school export configuration.
 *
 * Storage strategy: typed adapter over `localStorage` today, designed to swap
 * to Lovable Cloud later without touching consumers. All reads/writes go
 * through `exportConfigStore` so we can replace the backing store in one place.
 *
 * Semantics:
 * - `enabled[role][format]` is the SOURCE OF TRUTH for whether a role may use
 *   that format. When set, it OVERRIDES the hardcoded matrix in `userRole.ts`.
 * - When no config exists, the hardcoded matrix is used as the default seed.
 * - `defaultFormat[role]` is a UI hint for which format to pre-select. It is
 *   NOT a permission and never grants access on its own.
 */

import type { UserRole } from "./userRole";

export type ExportFormat = "csv" | "pdf" | "htmlFallback";

export interface RoleExportConfig {
  csv: boolean;
  pdf: boolean;
  htmlFallback: boolean;
}

export interface SchoolExportConfig {
  enabled: Record<UserRole, RoleExportConfig>;
  defaultFormat: Record<UserRole, ExportFormat>;
  /** ISO timestamp of last update — useful for cache busting + audit. */
  updatedAt: string;
}

const STORAGE_KEY = "school-export-config:v1";
const CHANGE_EVENT = "school-export-config-updated";

export const DEFAULT_SCHOOL_EXPORT_CONFIG: SchoolExportConfig = {
  enabled: {
    admin: { csv: true, pdf: true, htmlFallback: true },
    teacher: { csv: false, pdf: true, htmlFallback: true },
  },
  defaultFormat: {
    admin: "csv",
    teacher: "pdf",
  },
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function safeParse(raw: string | null): SchoolExportConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SchoolExportConfig>;
    if (!parsed.enabled || !parsed.defaultFormat) return null;
    return {
      enabled: {
        admin: { ...DEFAULT_SCHOOL_EXPORT_CONFIG.enabled.admin, ...parsed.enabled.admin },
        teacher: { ...DEFAULT_SCHOOL_EXPORT_CONFIG.enabled.teacher, ...parsed.enabled.teacher },
      },
      defaultFormat: {
        admin: parsed.defaultFormat.admin ?? DEFAULT_SCHOOL_EXPORT_CONFIG.defaultFormat.admin,
        teacher: parsed.defaultFormat.teacher ?? DEFAULT_SCHOOL_EXPORT_CONFIG.defaultFormat.teacher,
      },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const exportConfigStore = {
  get(): SchoolExportConfig {
    if (typeof window === "undefined") return DEFAULT_SCHOOL_EXPORT_CONFIG;
    return safeParse(window.localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_SCHOOL_EXPORT_CONFIG;
  },
  set(config: SchoolExportConfig) {
    if (typeof window === "undefined") return;
    const next = { ...config, updatedAt: new Date().toISOString() };
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
