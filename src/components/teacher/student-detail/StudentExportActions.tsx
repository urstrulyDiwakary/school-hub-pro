import { useCallback, useRef, useState } from "react";
import { Download, FileText, FileSpreadsheet, FileCode2, AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AttendanceStatus } from "@/data/teacherData";
import { TAG_LABELS } from "./types";
import type { StudentStats } from "./useStudentDetailData";
import type { StudentRemark } from "./types";
import { resolveEffectivePermissions, type UserRole } from "@/lib/userRole";
import { auditLogStore } from "@/lib/exportAuditLog";
import { exportTemplatesStore, type ExportTemplate } from "@/lib/exportTemplates";
import { validateStudentExport, formatValidationMessage } from "@/lib/exportValidation";
import { exportJobQueue, yieldToBrowser, chunkProgress } from "@/lib/exportJobQueue";
import { runInWorker } from "@/lib/exportWorkerClient";

/** Hard timeout retained only for synchronous validation paths. */
const EXPORT_TIMEOUT_MS = 15_000;

type ExportKind = "csv" | "pdf" | "htmlFallback";

function recordAudit(
  format: ExportKind,
  props: { studentName: string; rollNo: string; role?: UserRole },
  fallback?: boolean,
) {
  try {
    const { effectiveRole } = resolveEffectivePermissions(props.role);
    auditLogStore.record({
      format,
      role: effectiveRole,
      route: typeof window !== "undefined" ? window.location.pathname : "",
      studentId: props.rollNo,
      studentName: props.studentName,
      fallback,
    });
  } catch {
    // Audit must never block an export.
  }
}

interface StudentExportActionsProps {
  studentName: string;
  rollNo: string;
  dailyStatus: Map<string, AttendanceStatus>;
  stats: StudentStats;
  remarks: StudentRemark[];
  /** Override for testing or explicit role passing */
  role?: UserRole;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFilename(name: string, ext: string) {
  return `${name.replace(/\s+/g, "_")}_report.${ext}`;
}

/**
 * RFC 4180 escaping: a field is wrapped in double-quotes if it contains a
 * comma, double-quote, or newline (CR or LF). Embedded double-quotes are
 * doubled. Plain values pass through unquoted to keep snapshots stable.
 */
function csvField(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(...fields: Array<string | number>): string {
  return fields.map(csvField).join(",") + "\n";
}

/**
 * Run a synchronous export task with a hard timeout. The work itself is
 * synchronous (jsPDF, blob), but we wrap it in a microtask so an unresponsive
 * task can be reported to the user as a timeout instead of a frozen UI.
 */
function withTimeout<T>(work: () => T, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Export timed out")), ms);
    queueMicrotask(() => {
      try {
        const result = work();
        clearTimeout(timer);
        resolve(result);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

function identityRows(props: StudentExportActionsProps, t: ExportTemplate): Array<[string, string | number]> {
  const rows: Array<[string, string | number]> = [];
  if (t.identity.name) rows.push(["Student", props.studentName]);
  if (t.identity.rollNo) rows.push(["Roll No", props.rollNo]);
  if (t.identity.admissionNo) rows.push(["Admission No", props.rollNo]);
  if (t.identity.class) rows.push(["Class", "—"]);
  return rows;
}

function remarksByDate(remarks: StudentRemark[]): Map<string, string> {
  const map = new Map<string, string>();
  remarks.forEach((r) => {
    if (!r.date || !r.text) return;
    const key = r.date.slice(0, 10);
    const label = `[${TAG_LABELS[r.tag]}] ${r.text}`;
    map.set(key, map.has(key) ? `${map.get(key)} | ${label}` : label);
  });
  return map;
}

function buildCsv(props: StudentExportActionsProps): string {
  const { dailyStatus, stats, remarks } = props;
  const t = exportTemplatesStore.get().csv;

  let csv = "Student Attendance & Remarks Report\n";
  identityRows(props, t).forEach(([k, v]) => { csv += csvRow(k, v); });
  if (t.sections.stats) {
    csv += csvRow("Attendance Rate", `${stats.rate}%`);
    csv += csvRow("Present", stats.present);
    csv += csvRow("Absent", stats.absent);
    csv += csvRow("Late", stats.late);
    csv += csvRow("Total Days", stats.total);
  }
  csv += "\n";

  if (t.sections.daily) {
    const cols = t.attendanceColumns;
    const header: string[] = [];
    if (cols.date) header.push("Date");
    if (cols.status) header.push("Status");
    if (cols.remarks) header.push("Remarks");
    if (header.length > 0) {
      csv += header.join(",") + "\n";
      const remarksMap = cols.remarks ? remarksByDate(remarks) : new Map<string, string>();
      Array.from(dailyStatus.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, status]) => {
          const row: Array<string | number> = [];
          if (cols.date) row.push(date);
          if (cols.status) row.push(status);
          if (cols.remarks) row.push(remarksMap.get(date) ?? "");
          csv += csvRow(...row);
        });
    }
  }

  if (t.sections.remarks && remarks.length > 0) {
    csv += "\nRemarks\nDate,Tag,Remark\n";
    remarks.forEach((r) => {
      csv += csvRow(
        format(parseISO(r.date), "yyyy-MM-dd HH:mm"),
        TAG_LABELS[r.tag],
        r.text,
      );
    });
  }
  return csv;
}

function exportCSV(props: StudentExportActionsProps) {
  const csv = buildCsv(props);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, safeFilename(props.studentName, "csv"));
  recordAudit("csv", props);
}

function buildPdf(props: StudentExportActionsProps): jsPDF {
  const { studentName, rollNo, dailyStatus, stats, remarks } = props;
  const t = exportTemplatesStore.get().pdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const sortedDates = Array.from(dailyStatus.keys()).sort();
  const dateRange =
    sortedDates.length > 0
      ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`
      : "No data";

  // Header — identity-aware
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(t.identity.name ? studentName : "Student Report", 40, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  const headerBits: string[] = [];
  if (t.identity.rollNo) headerBits.push(`Roll No: ${rollNo}`);
  if (t.identity.admissionNo) headerBits.push(`Admission: ${rollNo}`);
  headerBits.push(`Range: ${dateRange}`);
  headerBits.push(`Generated: ${format(new Date(), "MMM dd, yyyy")}`);
  doc.text(headerBits.join("  •  "), 40, 66);
  doc.setTextColor(0);

  let cursorY = 96;

  if (t.sections.stats) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance Summary", 40, cursorY);
    autoTable(doc, {
      startY: cursorY + 8,
      head: [["Rate", "Present", "Absent", "Late", "Total"]],
      body: [[
        `${stats.rate}%`,
        String(stats.present),
        String(stats.absent),
        String(stats.late),
        String(stats.total),
      ]],
      theme: "grid",
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));
  if (t.sections.daily && sorted.length > 0) {
    const cols = t.attendanceColumns;
    const head: string[] = [];
    if (cols.date) head.push("Date");
    if (cols.status) head.push("Status");
    if (cols.remarks) head.push("Remarks");
    if (head.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Daily Attendance (${stats.total} days)`, 40, cursorY);
      const remarksMap = cols.remarks ? remarksByDate(remarks) : new Map<string, string>();
      autoTable(doc, {
        startY: cursorY + 8,
        head: [head],
        body: sorted.map(([d, s]) => {
          const row: string[] = [];
          if (cols.date) row.push(d);
          if (cols.status) row.push(s.charAt(0).toUpperCase() + s.slice(1));
          if (cols.remarks) row.push(remarksMap.get(d) ?? "");
          return row;
        }),
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
        columnStyles: cols.date ? { 0: { cellWidth: 100 } } : undefined,
      });
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    }
  }

  if (t.sections.remarks && remarks.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Teacher Remarks (${remarks.length})`, 40, cursorY);
    autoTable(doc, {
      startY: cursorY + 8,
      head: [["Date", "Tag", "Remark"]],
      body: remarks.map((r) => [
        format(parseISO(r.date), "MMM dd, HH:mm"),
        TAG_LABELS[r.tag],
        r.text,
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellWidth: "wrap" },
      headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 }, 2: { cellWidth: pageWidth - 270 } },
    });
  }

  return doc;
}

function buildHtmlFallback(props: Pick<StudentExportActionsProps, "studentName" | "rollNo" | "stats" | "dailyStatus" | "remarks">) {
  const { studentName, rollNo, stats, dailyStatus, remarks } = props;
  const t = exportTemplatesStore.get().htmlFallback;
  const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dateRange = sorted.length
    ? `${sorted[0][0]} to ${sorted[sorted.length - 1][0]}`
    : "No data";
  const cols = t.attendanceColumns;
  const remarksMap = cols.remarks ? remarksByDate(remarks) : new Map<string, string>();
  const dailyHeader = [
    cols.date ? "<th>Date</th>" : "",
    cols.status ? "<th>Status</th>" : "",
    cols.remarks ? "<th>Remarks</th>" : "",
  ].join("");
  const rows = sorted.map(([d, s]) => {
    const cells = [
      cols.date ? `<td>${d}</td>` : "",
      cols.status ? `<td>${s}</td>` : "",
      cols.remarks ? `<td>${remarksMap.get(d) ?? ""}</td>` : "",
    ].join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  const remarkRows = remarks
    .map((r) => `<tr><td>${format(parseISO(r.date), "MMM dd, HH:mm")}</td><td>${TAG_LABELS[r.tag]}</td><td>${r.text}</td></tr>`)
    .join("");
  const idBits: string[] = [];
  if (t.identity.rollNo) idBits.push(`Roll No: ${rollNo}`);
  if (t.identity.admissionNo) idBits.push(`Admission: ${rollNo}`);
  idBits.push(`Range: ${dateRange}`);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${studentName} Report</title>
<style>body{font-family:system-ui,Arial,sans-serif;margin:40px;color:#222}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5}</style>
</head><body><h1>${t.identity.name ? studentName : "Student Report"}</h1><p>${idBits.join(" • ")}</p>
${t.sections.stats ? `<h2>Attendance Summary</h2><p>Rate: ${stats.rate}% • Present: ${stats.present} • Absent: ${stats.absent} • Late: ${stats.late} • Total: ${stats.total}</p>` : ""}
${t.sections.daily && dailyHeader ? `<h2>Daily Attendance</h2><table><tr>${dailyHeader}</tr>${rows}</table>` : ""}
${t.sections.remarks && remarks.length ? `<h2>Remarks</h2><table><tr><th>Date</th><th>Tag</th><th>Remark</th></tr>${remarkRows}</table>` : ""}
</body></html>`;
}

function exportPDF(props: StudentExportActionsProps) {
  try {
    const doc = buildPdf(props);
    doc.save(safeFilename(props.studentName, "pdf"));
    recordAudit("pdf", props);
    return { ok: true as const, fallback: false };
  } catch (err) {
    const html = buildHtmlFallback(props);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    downloadBlob(blob, safeFilename(props.studentName, "html"));
    recordAudit("htmlFallback", props, true);
    return { ok: true as const, fallback: true, originalError: err };
  }
}

function exportHTML(props: StudentExportActionsProps) {
  const html = buildHtmlFallback(props);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  downloadBlob(blob, safeFilename(props.studentName, "html"));
  recordAudit("htmlFallback", props, false);
}


interface ExportError {
  kind: ExportKind;
  message: string;
}

export default function StudentExportActions(props: StudentExportActionsProps) {
  // Route-aware guard: intersect prop role with the role detected from the
  // current URL. The stricter side wins, so a teacher route can NEVER expose
  // CSV even if `role="admin"` is passed or UI state is manipulated.
  const perms = resolveEffectivePermissions(props.role);

  const [busy, setBusy] = useState<ExportKind | null>(null);
  const [error, setError] = useState<ExportError | null>(null);
  const lastAttempt = useRef<ExportKind | null>(null);

  const runExport = useCallback(
    async (kind: ExportKind) => {
      // Defense-in-depth: re-check at click time in case props or
      // route changed between render and click.
      const live = resolveEffectivePermissions(props.role);
      if (!live[kind]) return;

      lastAttempt.current = kind;

      // Pre-flight validation — for CSV especially, surface specific issues
      // before generating an invalid file.
      const validation = validateStudentExport(props);
      if (!validation.ok) {
        const message = formatValidationMessage(validation);
        toast.error(message);
        setError({ kind, message });
        return;
      }
      if (validation.warnings.length > 0) {
        toast.warning(validation.warnings[0].message);
      }

      setBusy(kind);
      setError(null);
      try {
        if (kind === "csv") {
          await withTimeout(() => exportCSV(props), EXPORT_TIMEOUT_MS);
          toast.success("CSV downloaded");
        } else if (kind === "pdf") {
          const result = await withTimeout(() => exportPDF(props), EXPORT_TIMEOUT_MS);
          if (result.fallback) {
            toast.warning("PDF generation failed — downloaded HTML report as fallback");
          } else {
            toast.success("PDF downloaded");
          }
        } else {
          await withTimeout(() => exportHTML(props), EXPORT_TIMEOUT_MS);
          toast.success("HTML downloaded");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message === "Export timed out";
        const friendly =
          kind === "csv"
            ? isTimeout
              ? "CSV export timed out"
              : "Failed to generate CSV"
            : kind === "pdf"
              ? isTimeout
                ? "PDF export timed out"
                : "Failed to generate report"
              : isTimeout
                ? "HTML export timed out"
                : "Failed to generate HTML";
        toast.error(friendly);
        setError({ kind, message: friendly });
      } finally {
        setBusy(null);
      }
    },
    [props],
  );

  const retry = useCallback(() => {
    if (lastAttempt.current) void runExport(lastAttempt.current);
  }, [runExport]);

  if (!perms.csv && !perms.pdf && !perms.htmlFallback) return null;

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" disabled={busy !== null}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {busy ? "Exporting…" : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {perms.csv && (
            <DropdownMenuItem
              onClick={() => {
                if (!resolveEffectivePermissions(props.role).csv) return;
                void runExport("csv");
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download CSV
            </DropdownMenuItem>
          )}
          {perms.pdf && (
            <DropdownMenuItem onClick={() => void runExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
          )}
          {perms.htmlFallback && (
            <DropdownMenuItem
              onClick={() => {
                if (!resolveEffectivePermissions(props.role).htmlFallback) return;
                void runExport("htmlFallback");
              }}
            >
              <FileCode2 className="mr-2 h-4 w-4" />
              Download HTML
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive" role="alert" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">Export failed</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2 text-xs">
            <span>{error.message}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={retry}
              disabled={busy !== null}
              className="h-7 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
