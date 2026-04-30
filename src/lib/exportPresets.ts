/**
 * Preset templates that admins can apply per format with one click.
 *
 * Each preset returns a fresh ExportTemplate so callers can drop it straight
 * into the templates store without mutating shared state. Presets are
 * intentionally opinionated — admins can still tweak individual switches
 * after applying.
 */

import type { ExportTemplate } from "./exportTemplates";

export type ExportPresetId =
  | "attendance-only"
  | "full-academic"
  | "summary-only"
  | "daily-with-remarks";

export interface ExportPreset {
  id: ExportPresetId;
  label: string;
  description: string;
  build: () => ExportTemplate;
}

const ATTENDANCE_ONLY: ExportTemplate = {
  identity: { name: true, rollNo: true, admissionNo: false, class: false },
  attendanceColumns: { date: true, status: true, remarks: false },
  sections: { stats: true, daily: true, remarks: false },
};

const FULL_ACADEMIC: ExportTemplate = {
  identity: { name: true, rollNo: true, admissionNo: true, class: true },
  attendanceColumns: { date: true, status: true, remarks: true },
  sections: { stats: true, daily: true, remarks: true },
};

const SUMMARY_ONLY: ExportTemplate = {
  identity: { name: true, rollNo: true, admissionNo: false, class: true },
  attendanceColumns: { date: false, status: false, remarks: false },
  sections: { stats: true, daily: false, remarks: false },
};

const DAILY_WITH_REMARKS: ExportTemplate = {
  identity: { name: true, rollNo: true, admissionNo: false, class: false },
  attendanceColumns: { date: true, status: true, remarks: true },
  sections: { stats: false, daily: true, remarks: true },
};

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: "attendance-only",
    label: "Attendance only",
    description: "Identity + stats + daily table. No remarks.",
    build: () => structuredClone(ATTENDANCE_ONLY),
  },
  {
    id: "full-academic",
    label: "Full academic profile",
    description: "Everything: full identity, all columns, all sections.",
    build: () => structuredClone(FULL_ACADEMIC),
  },
  {
    id: "summary-only",
    label: "Summary only",
    description: "Header + stats summary. No per-day table.",
    build: () => structuredClone(SUMMARY_ONLY),
  },
  {
    id: "daily-with-remarks",
    label: "Daily + remarks",
    description: "Per-day table with remarks column and remarks list. No stats.",
    build: () => structuredClone(DAILY_WITH_REMARKS),
  },
];
