/**
 * Export audit log.
 *
 * Records every successful export attempt (CSV / PDF / HTML fallback) along
 * with the role, route, student identifier, and timestamp. Admin-only viewer
 * surfaces this for compliance and debugging.
 *
 * Storage: localStorage today, swappable to Lovable Cloud later via the same
 * `auditLogStore` adapter shape.
 */

import type { UserRole } from "./userRole";
import type { ExportFormat } from "./exportConfig";

export interface ExportAuditEntry {
  id: string;
  timestamp: string;          // ISO
  role: UserRole;             // effective role at time of export
  route: string;              // window.location.pathname
  format: ExportFormat;       // csv | pdf | htmlFallback
  studentId: string;          // admission/roll number
  studentName: string;
  /** True when the export was the HTML fallback after a PDF failure. */
  fallback?: boolean;
}

const STORAGE_KEY = "export-audit-log:v1";
const CHANGE_EVENT = "export-audit-log-updated";
const MAX_ENTRIES = 500;

function readAll(): ExportAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExportAuditEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ExportAuditEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const auditLogStore = {
  list(): ExportAuditEntry[] {
    // Newest first
    return readAll().slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
  record(entry: Omit<ExportAuditEntry, "id" | "timestamp"> & { timestamp?: string }): ExportAuditEntry {
    const full: ExportAuditEntry = {
      id: makeId(),
      timestamp: entry.timestamp ?? new Date().toISOString(),
      role: entry.role,
      route: entry.route,
      format: entry.format,
      studentId: entry.studentId,
      studentName: entry.studentName,
      fallback: entry.fallback,
    };
    const next = [full, ...readAll()].slice(0, MAX_ENTRIES);
    writeAll(next);
    return full;
  },
  clear() {
    writeAll([]);
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
