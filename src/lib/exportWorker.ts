/// <reference lib="webworker" />
/**
 * Web Worker that builds CSV and HTML export payloads off the main thread.
 *
 * jsPDF needs DOM APIs and stays on the main thread, but plain string
 * generation (CSV rows, HTML templates) can be hundreds of KB for long date
 * ranges and is the actual bottleneck. The worker accepts a serialised job
 * payload and posts back chunks of progress + the final string.
 *
 * Message protocol:
 *   in:  { id, kind: "csv" | "html", payload }
 *   out: { id, type: "progress", value: 0..1, step? }
 *        { id, type: "done", result: string, bytes }
 *        { id, type: "error", message }
 */

export interface WorkerStudentInput {
  studentName: string;
  rollNo: string;
  /** Already-sorted [date, status] pairs. */
  daily: Array<[string, "present" | "absent" | "late"]>;
  stats: { rate: number; present: number; absent: number; late: number; total: number };
  remarks: Array<{ date: string; tag: string; text: string }>;
  template: {
    identity: { name: boolean; rollNo: boolean; admissionNo: boolean; class: boolean };
    attendanceColumns: { date: boolean; status: boolean; remarks: boolean };
    sections: { stats: boolean; daily: boolean; remarks: boolean };
  };
}

export type WorkerInbound =
  | { id: string; kind: "csv"; payload: WorkerStudentInput }
  | { id: string; kind: "html"; payload: WorkerStudentInput };

export type WorkerOutbound =
  | { id: string; type: "progress"; value: number; step?: string }
  | { id: string; type: "done"; result: string; bytes: number }
  | { id: string; type: "error"; message: string };

function csvField(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function csvRow(...fields: Array<string | number>): string {
  return fields.map(csvField).join(",") + "\n";
}

function remarksByDate(remarks: WorkerStudentInput["remarks"]): Map<string, string> {
  const map = new Map<string, string>();
  remarks.forEach((r) => {
    if (!r.date || !r.text) return;
    const key = r.date.slice(0, 10);
    const label = `[${r.tag}] ${r.text}`;
    map.set(key, map.has(key) ? `${map.get(key)} | ${label}` : label);
  });
  return map;
}

function buildCsv(p: WorkerStudentInput, post: (v: number, step?: string) => void): string {
  const t = p.template;
  let csv = "Student Attendance & Remarks Report\n";
  if (t.identity.name) csv += csvRow("Student", p.studentName);
  if (t.identity.rollNo) csv += csvRow("Roll No", p.rollNo);
  if (t.identity.admissionNo) csv += csvRow("Admission No", p.rollNo);
  if (t.identity.class) csv += csvRow("Class", "—");
  if (t.sections.stats) {
    csv += csvRow("Attendance Rate", `${p.stats.rate}%`);
    csv += csvRow("Present", p.stats.present);
    csv += csvRow("Absent", p.stats.absent);
    csv += csvRow("Late", p.stats.late);
    csv += csvRow("Total Days", p.stats.total);
  }
  csv += "\n";
  post(0.2, "Header written");

  if (t.sections.daily) {
    const cols = t.attendanceColumns;
    const header: string[] = [];
    if (cols.date) header.push("Date");
    if (cols.status) header.push("Status");
    if (cols.remarks) header.push("Remarks");
    if (header.length > 0) {
      csv += header.join(",") + "\n";
      const remarksMap = cols.remarks ? remarksByDate(p.remarks) : new Map<string, string>();
      const total = p.daily.length;
      const chunkSize = 500;
      for (let i = 0; i < total; i += chunkSize) {
        const slice = p.daily.slice(i, i + chunkSize);
        slice.forEach(([date, status]) => {
          const row: Array<string | number> = [];
          if (cols.date) row.push(date);
          if (cols.status) row.push(status);
          if (cols.remarks) row.push(remarksMap.get(date) ?? "");
          csv += csvRow(...row);
        });
        post(0.2 + 0.7 * Math.min(1, (i + chunkSize) / total), `Rows ${Math.min(i + chunkSize, total)}/${total}`);
      }
    }
  }

  if (t.sections.remarks && p.remarks.length > 0) {
    csv += "\nRemarks\nDate,Tag,Remark\n";
    p.remarks.forEach((r) => {
      csv += csvRow(r.date, r.tag, r.text);
    });
  }
  post(1, "Done");
  return csv;
}

function buildHtml(p: WorkerStudentInput, post: (v: number, step?: string) => void): string {
  const t = p.template;
  const sorted = p.daily;
  const dateRange = sorted.length ? `${sorted[0][0]} to ${sorted[sorted.length - 1][0]}` : "No data";
  const cols = t.attendanceColumns;
  const remarksMap = cols.remarks ? remarksByDate(p.remarks) : new Map<string, string>();
  const dailyHeader = [
    cols.date ? "<th>Date</th>" : "",
    cols.status ? "<th>Status</th>" : "",
    cols.remarks ? "<th>Remarks</th>" : "",
  ].join("");
  post(0.15, "Building rows");
  const rowsArr: string[] = [];
  const total = sorted.length;
  const chunkSize = 500;
  for (let i = 0; i < total; i += chunkSize) {
    sorted.slice(i, i + chunkSize).forEach(([d, s]) => {
      const cells = [
        cols.date ? `<td>${d}</td>` : "",
        cols.status ? `<td>${s}</td>` : "",
        cols.remarks ? `<td>${remarksMap.get(d) ?? ""}</td>` : "",
      ].join("");
      rowsArr.push(`<tr>${cells}</tr>`);
    });
    post(0.15 + 0.75 * Math.min(1, (i + chunkSize) / Math.max(1, total)), `Rows ${Math.min(i + chunkSize, total)}/${total}`);
  }
  const remarkRows = p.remarks
    .map((r) => `<tr><td>${r.date}</td><td>${r.tag}</td><td>${r.text}</td></tr>`)
    .join("");
  const idBits: string[] = [];
  if (t.identity.rollNo) idBits.push(`Roll No: ${p.rollNo}`);
  if (t.identity.admissionNo) idBits.push(`Admission: ${p.rollNo}`);
  idBits.push(`Range: ${dateRange}`);
  const out = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${p.studentName} Report</title>
<style>body{font-family:system-ui,Arial,sans-serif;margin:40px;color:#222}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5}</style>
</head><body><h1>${t.identity.name ? p.studentName : "Student Report"}</h1><p>${idBits.join(" • ")}</p>
${t.sections.stats ? `<h2>Attendance Summary</h2><p>Rate: ${p.stats.rate}% • Present: ${p.stats.present} • Absent: ${p.stats.absent} • Late: ${p.stats.late} • Total: ${p.stats.total}</p>` : ""}
${t.sections.daily && dailyHeader ? `<h2>Daily Attendance</h2><table><tr>${dailyHeader}</tr>${rowsArr.join("")}</table>` : ""}
${t.sections.remarks && p.remarks.length ? `<h2>Remarks</h2><table><tr><th>Date</th><th>Tag</th><th>Remark</th></tr>${remarkRows}</table>` : ""}
</body></html>`;
  post(1, "Done");
  return out;
}

self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data;
  const post = (out: WorkerOutbound) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(out);
  try {
    const report = (value: number, step?: string) => post({ id: msg.id, type: "progress", value, step });
    const result = msg.kind === "csv" ? buildCsv(msg.payload, report) : buildHtml(msg.payload, report);
    post({ id: msg.id, type: "done", result, bytes: result.length });
  } catch (err) {
    post({ id: msg.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};

export {};
