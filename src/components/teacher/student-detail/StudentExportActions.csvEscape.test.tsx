/**
 * CSV escaping regression tests.
 *
 * These tests assert that the Student Detail CSV export quotes and escapes
 * fields per RFC 4180 when they contain commas, double-quotes, CR, or LF —
 * for both student names AND remark text. The snapshot is locked so any
 * change to the escape rules will fail loudly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentExportActions from "./StudentExportActions";
import type { AttendanceStatus } from "@/data/teacherData";
import type { StudentRemark } from "./types";
import type { StudentStats } from "./useStudentDetailData";

// --- Mocks ---------------------------------------------------------------
const { toastMock } = vi.hoisted(() => ({
  toastMock: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));
vi.mock("jspdf", () => ({ default: vi.fn() }));
vi.mock("jspdf-autotable", () => ({ default: vi.fn() }));

// --- Capture Blob payload ------------------------------------------------
let capturedCsv = "";
const RealBlob = global.Blob;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  capturedCsv = "";
  vi.clearAllMocks();
  global.Blob = function (parts: BlobPart[], opts?: BlobPropertyBag) {
    try {
      capturedCsv = (parts ?? []).map((p) => (typeof p === "string" ? p : "")).join("");
    } catch { /* ignore */ }
    return new RealBlob(parts, opts);
  } as unknown as typeof Blob;
  URL.createObjectURL = vi.fn(() => "blob:mock") as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  // Reset config (important because previous suites might have mutated it)
  window.localStorage.clear();
});

afterEach(() => {
  global.Blob = RealBlob;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

const stats: StudentStats = { present: 1, absent: 0, late: 0, total: 1, rate: 100 };
const dailyStatus = new Map<string, AttendanceStatus>([["2025-01-01", "present"]]);

async function triggerCsv(
  studentName: string,
  remarks: StudentRemark[],
  rollNo = "1",
) {
  const user = userEvent.setup();
  render(
    <StudentExportActions
      studentName={studentName}
      rollNo={rollNo}
      dailyStatus={dailyStatus}
      stats={stats}
      remarks={remarks}
      role="admin"
    />,
  );
  await user.click(screen.getByRole("button", { name: /export/i }));
  await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
  await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
}

// --- Tests ---------------------------------------------------------------

describe("CSV escaping — student names", () => {
  it("quotes a name containing a comma", async () => {
    await triggerCsv("Kumar, Asha", []);
    expect(capturedCsv).toContain('Student,"Kumar, Asha"');
  });

  it("quotes and doubles a name containing a double-quote", async () => {
    await triggerCsv('Asha "Ace" Kumar', []);
    expect(capturedCsv).toContain('Student,"Asha ""Ace"" Kumar"');
  });

  it("quotes a name containing a newline", async () => {
    await triggerCsv("Asha\nKumar", []);
    expect(capturedCsv).toMatch(/Student,"Asha\nKumar"/);
  });

  it("quotes a name containing a carriage return", async () => {
    await triggerCsv("Asha\rKumar", []);
    expect(capturedCsv).toMatch(/Student,"Asha\rKumar"/);
  });

  it("leaves plain ASCII names unquoted", async () => {
    await triggerCsv("Asha Kumar", []);
    expect(capturedCsv).toContain("Student,Asha Kumar");
    expect(capturedCsv).not.toContain('Student,"Asha Kumar"');
  });
});

describe("CSV escaping — remark text", () => {
  const remark = (text: string): StudentRemark[] => [
    { id: "r1", text, date: "2025-01-02T10:00:00.000Z", tag: "general" },
  ];

  it("quotes a remark containing a comma", async () => {
    await triggerCsv("Asha", remark("Late, but improving"));
    expect(capturedCsv).toContain('General,"Late, but improving"');
  });

  it("quotes and doubles a remark containing double-quotes", async () => {
    await triggerCsv("Asha", remark('Said "hi" today'));
    expect(capturedCsv).toContain('General,"Said ""hi"" today"');
  });

  it("quotes a remark containing a newline", async () => {
    await triggerCsv("Asha", remark("Line 1\nLine 2"));
    expect(capturedCsv).toMatch(/General,"Line 1\nLine 2"/);
  });

  it("quotes a remark containing a CRLF sequence", async () => {
    await triggerCsv("Asha", remark("Line 1\r\nLine 2"));
    expect(capturedCsv).toMatch(/General,"Line 1\r\nLine 2"/);
  });

  it("handles all three special chars in one remark", async () => {
    await triggerCsv("Asha", remark('A, B "C"\nD'));
    expect(capturedCsv).toContain('General,"A, B ""C""\nD"');
  });

  it("leaves plain remark text unquoted", async () => {
    await triggerCsv("Asha", remark("Great work"));
    expect(capturedCsv).toContain("General,Great work");
    expect(capturedCsv).not.toContain('General,"Great work"');
  });
});

describe("CSV escaping — locked snapshot with all special chars", () => {
  it("matches snapshot for tricky names + remarks", async () => {
    const remarks: StudentRemark[] = [
      { id: "1", text: "Plain text", date: "2025-01-02T10:00:00.000Z", tag: "general" },
      { id: "2", text: 'Has "quotes"', date: "2025-01-02T11:00:00.000Z", tag: "appreciation" },
      { id: "3", text: "Has, comma", date: "2025-01-02T12:00:00.000Z", tag: "concern" },
      { id: "4", text: "Has\nnewline", date: "2025-01-02T13:00:00.000Z", tag: "improvement" },
    ];
    await triggerCsv('Tricky, "Name"', remarks, "R-1");

    expect(capturedCsv).toMatchInlineSnapshot(`
      "Student Attendance & Remarks Report
      Student,"Tricky, ""Name"""
      Roll No,R-1
      Attendance Rate,100%
      Present,1
      Absent,0
      Late,0
      Total Days,1

      Date,Status
      2025-01-01,present

      Remarks
      Date,Tag,Remark
      2025-01-02 10:00,General,Plain text
      2025-01-02 11:00,Appreciation,"Has ""quotes"""
      2025-01-02 12:00,Concern,"Has, comma"
      2025-01-02 13:00,Improvement,"Has
      newline"
      "
    `);
  });
});
