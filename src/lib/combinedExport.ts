/**
 * Combined multi-student PDF export.
 *
 * Generates a single PDF document with one section per selected student,
 * scoped to the chosen date range. Each section reuses the same layout as
 * the per-student export (header + stats + daily table) and starts on a new
 * page so admins can split or print individually.
 *
 * Today's data plumbing: the demo `Students` page only carries roster info
 * (no attendance records), so we generate deterministic synthetic attendance
 * from a seeded PRNG keyed on the student's admission number. Once attendance
 * data is wired into this page, replace `synthesiseDailyStatus` with the
 * real lookup — the rest of the pipeline does not change.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { AttendanceStatus } from "@/data/teacherData";
import { auditLogStore } from "./exportAuditLog";
import { exportTemplatesStore } from "./exportTemplates";

export interface CombinedStudentInput {
  id: string;
  admissionNo: string;
  name: string;
  className: string;
}

export interface CombinedExportOptions {
  students: CombinedStudentInput[];
  /** Inclusive ISO dates (yyyy-MM-dd). */
  fromDate: string;
  toDate: string;
}

/** Hash a string to a uint32 for the seeded PRNG. */
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function synthesiseDailyStatus(
  admissionNo: string,
  fromDate: string,
  toDate: string,
): Map<string, AttendanceStatus> {
  const rng = mulberry32(hashSeed(admissionNo));
  const days = eachDayOfInterval({ start: parseISO(fromDate), end: parseISO(toDate) });
  const map = new Map<string, AttendanceStatus>();
  days.forEach((d) => {
    // Skip Sundays for realism
    if (d.getDay() === 0) return;
    const r = rng();
    let status: AttendanceStatus;
    if (r < 0.82) status = "present";
    else if (r < 0.94) status = "absent";
    else status = "late";
    map.set(format(d, "yyyy-MM-dd"), status);
  });
  return map;
}

interface StudentSection {
  student: CombinedStudentInput;
  daily: Map<string, AttendanceStatus>;
  rate: number;
  present: number;
  absent: number;
  late: number;
  total: number;
}

function summarise(daily: Map<string, AttendanceStatus>) {
  let present = 0, absent = 0, late = 0;
  daily.forEach((s) => {
    if (s === "present") present++;
    else if (s === "absent") absent++;
    else if (s === "late") late++;
  });
  const total = daily.size;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { present, absent, late, total, rate };
}

export interface CombinedExportResult {
  ok: true;
  studentCount: number;
  pages: number;
}

export function buildCombinedReport(opts: CombinedExportOptions): jsPDF {
  const t = exportTemplatesStore.get().pdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover page
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Combined Attendance Report", 40, 70);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text(`Range: ${opts.fromDate} to ${opts.toDate}`, 40, 92);
  doc.text(`Students: ${opts.students.length}`, 40, 108);
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 40, 124);
  doc.setTextColor(0);

  // Roster table on cover
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Included students", 40, 160);
  autoTable(doc, {
    startY: 168,
    head: [["#", "Admission", "Name", "Class"]],
    body: opts.students.map((s, i) => [String(i + 1), s.admissionNo, s.name, s.className]),
    theme: "striped",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
  });

  const sections: StudentSection[] = opts.students.map((student) => {
    const daily = synthesiseDailyStatus(student.admissionNo, opts.fromDate, opts.toDate);
    return { student, daily, ...summarise(daily) };
  });

  sections.forEach((sec) => {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(t.identity.name ? sec.student.name : "Student Report", 40, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    const headerBits: string[] = [];
    if (t.identity.admissionNo) headerBits.push(`Admission: ${sec.student.admissionNo}`);
    if (t.identity.class) headerBits.push(`Class: ${sec.student.className}`);
    headerBits.push(`Range: ${opts.fromDate} to ${opts.toDate}`);
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
          `${sec.rate}%`, String(sec.present), String(sec.absent),
          String(sec.late), String(sec.total),
        ]],
        theme: "grid",
        styles: { fontSize: 10, halign: "center" },
        headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
      });
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    }

    if (t.sections.daily && sec.daily.size > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Daily Attendance (${sec.total} days)`, 40, cursorY);
      const rows = Array.from(sec.daily.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([d, s]) => [d, s.charAt(0).toUpperCase() + s.slice(1)]);
      autoTable(doc, {
        startY: cursorY + 8,
        head: [["Date", "Status"]],
        body: rows,
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: pageWidth - 180 } },
      });
    }
  });

  return doc;
}

export function exportCombinedPdf(opts: CombinedExportOptions, role: "admin" | "teacher" = "admin"): CombinedExportResult {
  const doc = buildCombinedReport(opts);
  const filename = `combined_report_${opts.fromDate}_to_${opts.toDate}.pdf`;
  doc.save(filename);

  // Audit one entry per student for traceability.
  opts.students.forEach((s) => {
    try {
      auditLogStore.record({
        format: "pdf",
        role,
        route: typeof window !== "undefined" ? window.location.pathname : "",
        studentId: s.admissionNo,
        studentName: s.name,
      });
    } catch {
      // Audit must never block an export.
    }
  });

  return { ok: true, studentCount: opts.students.length, pages: doc.getNumberOfPages() };
}
