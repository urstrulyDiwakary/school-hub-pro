/**
 * Validation for student export payloads.
 *
 * Runs BEFORE generating CSV/PDF/HTML so we can produce specific, actionable
 * error messages instead of a generic "export failed". Returns a list of
 * errors and warnings; callers decide whether warnings should block.
 */

import type { AttendanceStatus } from "@/data/teacherData";
import type { StudentStats } from "@/components/teacher/student-detail/useStudentDetailData";
import type { StudentRemark } from "@/components/teacher/student-detail/types";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidatableExport {
  studentName: string;
  rollNo: string;
  dailyStatus: Map<string, AttendanceStatus>;
  stats: StudentStats;
  remarks: StudentRemark[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES: AttendanceStatus[] = ["present", "absent", "late"];

export function validateStudentExport(input: ValidatableExport): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!input.studentName?.trim()) {
    errors.push({ code: "MISSING_NAME", severity: "error", message: "Student name is missing." });
  }
  if (!input.rollNo?.trim()) {
    errors.push({ code: "MISSING_ROLL", severity: "error", message: "Roll number is missing." });
  }

  const total = input.dailyStatus.size;
  if (total === 0) {
    errors.push({
      code: "EMPTY_RANGE",
      severity: "error",
      message: "No attendance records in the selected range. Pick a wider date range and try again.",
    });
  }

  // Check date keys + status values
  let invalidDates = 0;
  let invalidStatuses = 0;
  input.dailyStatus.forEach((status, date) => {
    if (!ISO_DATE.test(date)) invalidDates++;
    if (!VALID_STATUSES.includes(status)) invalidStatuses++;
  });
  if (invalidDates > 0) {
    errors.push({
      code: "INVALID_DATE_KEYS",
      severity: "error",
      message: `${invalidDates} attendance record(s) have an invalid date format (expected YYYY-MM-DD).`,
    });
  }
  if (invalidStatuses > 0) {
    errors.push({
      code: "INVALID_STATUS",
      severity: "error",
      message: `${invalidStatuses} attendance record(s) have an unrecognised status. Refresh the data and retry.`,
    });
  }

  // Stats sanity
  const statsTotal = input.stats.present + input.stats.absent + input.stats.late;
  if (total > 0 && statsTotal !== input.stats.total) {
    warnings.push({
      code: "STATS_MISMATCH",
      severity: "warning",
      message: `Stats totals don't add up (${statsTotal} vs ${input.stats.total}). Report may show inconsistent numbers.`,
    });
  }
  if (input.stats.rate < 0 || input.stats.rate > 100) {
    errors.push({
      code: "INVALID_RATE",
      severity: "error",
      message: `Attendance rate is out of range (${input.stats.rate}%).`,
    });
  }

  // Remarks
  const malformedRemarks = input.remarks.filter((r) => !r.date || !r.text).length;
  if (malformedRemarks > 0) {
    warnings.push({
      code: "MALFORMED_REMARKS",
      severity: "warning",
      message: `${malformedRemarks} remark(s) are missing a date or text and will be skipped.`,
    });
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function formatValidationMessage(result: ValidationResult): string {
  if (result.errors.length === 0) return "";
  if (result.errors.length === 1) return result.errors[0].message;
  return `${result.errors.length} issues prevent export: ${result.errors.map((e) => e.message).join(" ")}`;
}
