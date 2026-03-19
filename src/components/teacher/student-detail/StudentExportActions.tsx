import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AttendanceStatus } from "@/data/teacherData";
import type { StudentRemark } from "./types";
import { TAG_LABELS } from "./types";
import { format, parseISO } from "date-fns";

interface StudentExportActionsProps {
  studentName: string;
  rollNo: string;
  dailyStatus: Map<string, AttendanceStatus>;
  stats: { present: number; absent: number; late: number; total: number; rate: number };
  studentId: string;
}

function getRemarks(studentId: string): StudentRemark[] {
  try {
    const stored = localStorage.getItem(`teacher-remarks-${studentId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function exportCSV({ studentName, rollNo, dailyStatus, stats, studentId }: StudentExportActionsProps) {
  const remarks = getRemarks(studentId);
  let csv = "Student Attendance & Remarks Report\n";
  csv += `Student,${studentName}\nRoll No,${rollNo}\n`;
  csv += `Attendance Rate,${stats.rate}%\nPresent,${stats.present}\nAbsent,${stats.absent}\nLate,${stats.late}\nTotal Days,${stats.total}\n\n`;

  csv += "Date,Status\n";
  const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));
  sorted.forEach(([date, status]) => {
    csv += `${date},${status}\n`;
  });

  if (remarks.length > 0) {
    csv += "\nRemarks\nDate,Tag,Remark\n";
    remarks.forEach((r) => {
      csv += `${format(parseISO(r.date), "yyyy-MM-dd HH:mm")},${TAG_LABELS[r.tag]},"${r.text.replace(/"/g, '""')}"\n`;
    });
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${studentName.replace(/\s+/g, "_")}_report.csv`);
  toast.success("CSV downloaded");
}

function exportPDF({ studentName, rollNo, dailyStatus, stats, studentId }: StudentExportActionsProps) {
  const remarks = getRemarks(studentId);
  const sorted = Array.from(dailyStatus.entries()).sort(([a], [b]) => a.localeCompare(b));

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${studentName} Report</title>
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#222;font-size:12px}
  h1{font-size:18px;margin-bottom:4px}
  h2{font-size:14px;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}
  .subtitle{color:#666;font-size:12px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
  th{background:#f5f5f5;font-weight:600}
  .present{color:#0d9488} .absent{color:#dc2626} .late{color:#f59e0b}
  .stats{display:flex;gap:16px;margin:12px 0}
  .stat-box{border:1px solid #ddd;border-radius:6px;padding:10px 16px;text-align:center}
  .stat-val{font-size:20px;font-weight:700} .stat-label{font-size:10px;color:#888}
  @media print{body{margin:20px}}
</style></head><body>
<h1>${studentName}</h1>
<div class="subtitle">Roll No: ${rollNo} • Generated: ${format(new Date(), "MMM dd, yyyy")}</div>

<h2>Attendance Summary</h2>
<div class="stats">
  <div class="stat-box"><div class="stat-val">${stats.rate}%</div><div class="stat-label">Rate</div></div>
  <div class="stat-box"><div class="stat-val present">${stats.present}</div><div class="stat-label">Present</div></div>
  <div class="stat-box"><div class="stat-val absent">${stats.absent}</div><div class="stat-label">Absent</div></div>
  <div class="stat-box"><div class="stat-val late">${stats.late}</div><div class="stat-label">Late</div></div>
</div>

<h2>Daily Attendance (${stats.total} days)</h2>
<table><tr><th>Date</th><th>Status</th></tr>
${sorted.map(([d, s]) => `<tr><td>${d}</td><td class="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</td></tr>`).join("")}
</table>`;

  if (remarks.length > 0) {
    html += `<h2>Teacher Remarks (${remarks.length})</h2>
<table><tr><th>Date</th><th>Tag</th><th>Remark</th></tr>
${remarks.map((r) => `<tr><td>${format(parseISO(r.date), "MMM dd, HH:mm")}</td><td>${TAG_LABELS[r.tag]}</td><td>${r.text}</td></tr>`).join("")}
</table>`;
  }

  html += `</body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
    toast.success("PDF print dialog opened");
  } else {
    toast.error("Please allow pop-ups to export PDF");
  }
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

export default function StudentExportActions(props: StudentExportActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(props)}>
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPDF(props)}>
          Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
