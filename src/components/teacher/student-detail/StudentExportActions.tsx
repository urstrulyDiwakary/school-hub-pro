import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function recordAudit(
  format: "csv" | "pdf" | "htmlFallback",
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

function exportCSV({ studentName, rollNo, dailyStatus, stats, remarks }: StudentExportActionsProps) {
  let csv = "Student Attendance & Remarks Report\n";
  csv += `Student,${studentName}\nRoll No,${rollNo}\n`;
  csv += `Attendance Rate,${stats.rate}%\nPresent,${stats.present}\nAbsent,${stats.absent}\nLate,${stats.late}\nTotal Days,${stats.total}\n\n`;

  csv += "Date,Status\n";
  Array.from(dailyStatus.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, status]) => {
      csv += `${date},${status}\n`;
    });

  if (remarks.length > 0) {
    csv += "\nRemarks\nDate,Tag,Remark\n";
    remarks.forEach((r) => {
      csv += `${format(parseISO(r.date), "yyyy-MM-dd HH:mm")},${TAG_LABELS[r.tag]},"${r.text.replace(/"/g, '""')}"\n`;
    });
  }

  try {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, safeFilename(studentName, "csv"));
    toast.success("CSV downloaded");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate CSV");
  }
}

function exportPDF({ studentName, rollNo, dailyStatus, stats, remarks }: StudentExportActionsProps) {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(studentName, 40, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(
      `Roll No: ${rollNo}  •  Generated: ${format(new Date(), "MMM dd, yyyy")}`,
      40,
      66,
    );
    doc.setTextColor(0);

    // Stats
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance Summary", 40, 96);

    autoTable(doc, {
      startY: 104,
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

    // Daily attendance
    const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));
    if (sorted.length > 0) {
      const startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Daily Attendance (${stats.total} days)`, 40, startY);
      autoTable(doc, {
        startY: startY + 8,
        head: [["Date", "Status"]],
        body: sorted.map(([d, s]) => [d, s.charAt(0).toUpperCase() + s.slice(1)]),
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 100 } },
      });
    }

    // Remarks
    if (remarks.length > 0) {
      const startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Teacher Remarks (${remarks.length})`, 40, startY);
      autoTable(doc, {
        startY: startY + 8,
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

    doc.save(safeFilename(studentName, "pdf"));
    toast.success("PDF downloaded");
  } catch (err) {
    console.error(err);
    // Fallback: download an HTML report the user can open and print
    try {
      const html = buildHtmlFallback({ studentName, rollNo, stats, dailyStatus, remarks });
      const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
      downloadBlob(blob, safeFilename(studentName, "html"));
      toast.warning("PDF generation failed — downloaded HTML report as fallback");
    } catch {
      toast.error("Failed to generate report");
    }
  }
}

function buildHtmlFallback({
  studentName, rollNo, stats, dailyStatus, remarks,
}: Pick<StudentExportActionsProps, "studentName" | "rollNo" | "stats" | "dailyStatus" | "remarks">) {
  const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));
  const rows = sorted.map(([d, s]) => `<tr><td>${d}</td><td>${s}</td></tr>`).join("");
  const remarkRows = remarks
    .map((r) => `<tr><td>${format(parseISO(r.date), "MMM dd, HH:mm")}</td><td>${TAG_LABELS[r.tag]}</td><td>${r.text}</td></tr>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${studentName} Report</title>
<style>body{font-family:system-ui,Arial,sans-serif;margin:40px;color:#222}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5}</style>
</head><body><h1>${studentName}</h1><p>Roll No: ${rollNo}</p>
<h2>Attendance Summary</h2><p>Rate: ${stats.rate}% • Present: ${stats.present} • Absent: ${stats.absent} • Late: ${stats.late} • Total: ${stats.total}</p>
<h2>Daily Attendance</h2><table><tr><th>Date</th><th>Status</th></tr>${rows}</table>
${remarks.length ? `<h2>Remarks</h2><table><tr><th>Date</th><th>Tag</th><th>Remark</th></tr>${remarkRows}</table>` : ""}
</body></html>`;
}

export default function StudentExportActions(props: StudentExportActionsProps) {
  // Route-aware guard: intersect prop role with the role detected from the
  // current URL. The stricter side wins, so a teacher route can NEVER expose
  // CSV even if `role="admin"` is passed or UI state is manipulated.
  const perms = resolveEffectivePermissions(props.role);

  if (!perms.csv && !perms.pdf) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {perms.csv && (
          <DropdownMenuItem
            onClick={() => {
              // Defense-in-depth: re-check at click time in case props or
              // route changed between render and click.
              if (!resolveEffectivePermissions(props.role).csv) return;
              exportCSV(props);
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download CSV
          </DropdownMenuItem>
        )}
        {perms.pdf && (
          <DropdownMenuItem onClick={() => exportPDF(props)}>
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
