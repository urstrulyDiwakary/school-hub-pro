/**
 * Export field templates.
 *
 * Admin-configurable choice of which fields/sections appear in each format.
 * Stored in localStorage; mirrors the `exportConfigStore` adapter shape so it
 * can swap to Lovable Cloud later.
 *
 * Identity fields are placed in the report HEADER (PDF/HTML) or the metadata
 * block (CSV). Attendance columns appear in the per-day table. Sections gate
 * whole blocks (stats summary, daily table, remarks list).
 */

export type IdentityField = "name" | "rollNo" | "admissionNo" | "class";
export type AttendanceColumn = "date" | "status" | "remarks";
export type ReportSection = "stats" | "daily" | "remarks";

export interface ExportTemplate {
  /** Identity fields shown in header / CSV meta block. */
  identity: Record<IdentityField, boolean>;
  /** Columns in the per-day attendance table. */
  attendanceColumns: Record<AttendanceColumn, boolean>;
  /** Major sections in PDF/HTML reports. */
  sections: Record<ReportSection, boolean>;
}

export interface ExportTemplates {
  csv: ExportTemplate;
  pdf: ExportTemplate;
  htmlFallback: ExportTemplate;
  updatedAt: string;
}

const STORAGE_KEY = "export-templates:v1";
const CHANGE_EVENT = "export-templates-updated";

/**
 * Defaults intentionally match the LEGACY single-student export layout so
 * existing snapshot tests stay locked. New identity fields (admissionNo,
 * class) are off by default; admins opt in via the templates page.
 */
const FULL: ExportTemplate = {
  identity: { name: true, rollNo: true, admissionNo: false, class: false },
  attendanceColumns: { date: true, status: true, remarks: false },
  sections: { stats: true, daily: true, remarks: true },
};

export const DEFAULT_EXPORT_TEMPLATES: ExportTemplates = {
  csv: FULL,
  pdf: FULL,
  htmlFallback: FULL,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function safeParse(raw: string | null): ExportTemplates | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ExportTemplates>;
    const merge = (t: Partial<ExportTemplate> | undefined): ExportTemplate => ({
      identity: { ...FULL.identity, ...(t?.identity ?? {}) },
      attendanceColumns: { ...FULL.attendanceColumns, ...(t?.attendanceColumns ?? {}) },
      sections: { ...FULL.sections, ...(t?.sections ?? {}) },
    });
    return {
      csv: merge(parsed.csv),
      pdf: merge(parsed.pdf),
      htmlFallback: merge(parsed.htmlFallback),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const exportTemplatesStore = {
  get(): ExportTemplates {
    if (typeof window === "undefined") return DEFAULT_EXPORT_TEMPLATES;
    return safeParse(window.localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_EXPORT_TEMPLATES;
  },
  set(next: ExportTemplates) {
    if (typeof window === "undefined") return;
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
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
