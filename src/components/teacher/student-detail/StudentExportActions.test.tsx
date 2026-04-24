import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentExportActions from "./StudentExportActions";
import type { AttendanceStatus } from "@/data/teacherData";
import type { StudentRemark } from "./types";
import type { StudentStats } from "./useStudentDetailData";

// --- Mocks ---------------------------------------------------------------

const { toastMock, pdfSaveMock, pdfState } = vi.hoisted(() => ({
  toastMock: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  pdfSaveMock: vi.fn(),
  pdfState: { shouldThrow: false },
}));

vi.mock("sonner", () => ({ toast: toastMock }));

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => {
    if (pdfState.shouldThrow) throw new Error("pdf boom");
    return {
      internal: { pageSize: { getWidth: () => 595 } },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      setTextColor: vi.fn(),
      text: vi.fn(),
      save: pdfSaveMock,
      lastAutoTable: { finalY: 200 },
    };
  }),
}));
vi.mock("jspdf-autotable", () => ({ default: vi.fn() }));

let capturedCsv = "";
const downloadBlobSpy = vi.fn();
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

// --- Fixtures ------------------------------------------------------------

const stats: StudentStats = { present: 8, absent: 1, late: 1, total: 10, rate: 80 };

const dailyStatus = new Map<string, AttendanceStatus>([
  ["2025-01-03", "present"],
  ["2025-01-01", "present"],
  ["2025-01-02", "absent"],
]);

const remarks: StudentRemark[] = [
  { id: "1", text: "Great work", date: "2025-01-02T10:00:00.000Z", tag: "appreciation" },
  { id: "2", text: 'Said "hi"', date: "2025-01-03T10:00:00.000Z", tag: "general" },
];

const baseProps = {
  studentName: "Asha Kumar",
  rollNo: "12",
  dailyStatus,
  stats,
  remarks,
};

// --- Setup ---------------------------------------------------------------

beforeEach(() => {
  capturedCsv = "";
  pdfState.shouldThrow = false;
  vi.clearAllMocks();

  URL.createObjectURL = vi.fn((blob: Blob) => {
    // Read text out of the blob so tests can assert formatting/order
    blob.text().then((t) => { capturedCsv = t; }).catch(() => {});
    return "blob:mock";
  }) as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;

  // Stub anchor click so jsdom doesn't navigate
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
    downloadBlobSpy();
  });
});

afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /export/i }));
}

// --- Tests ---------------------------------------------------------------

describe("StudentExportActions — role-gated dropdown items", () => {
  it("admin sees both CSV and PDF options", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(screen.getByText(/download csv/i)).toBeInTheDocument();
    expect(screen.getByText(/download pdf/i)).toBeInTheDocument();
  });

  it("teacher NEVER sees CSV option, only PDF", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    expect(screen.queryByText(/download csv/i)).not.toBeInTheDocument();
    expect(screen.getByText(/download pdf/i)).toBeInTheDocument();
  });
});

describe("StudentExportActions — CSV format & column order", () => {
  it("CSV for admin includes attendance and remarks sections in expected order", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));

    // Wait one tick for blob.text() to resolve
    await act(async () => { await Promise.resolve(); });

    expect(toastMock.success).toHaveBeenCalledWith("CSV downloaded");

    // Header block
    expect(capturedCsv).toContain("Student Attendance & Remarks Report");
    expect(capturedCsv).toContain("Student,Asha Kumar");
    expect(capturedCsv).toContain("Roll No,12");
    expect(capturedCsv).toContain("Attendance Rate,80%");

    // Section ordering: stats -> attendance -> remarks
    const attIdx = capturedCsv.indexOf("Date,Status");
    const remIdx = capturedCsv.indexOf("Date,Tag,Remark");
    const ratePos = capturedCsv.indexOf("Attendance Rate");
    expect(ratePos).toBeGreaterThan(-1);
    expect(attIdx).toBeGreaterThan(ratePos);
    expect(remIdx).toBeGreaterThan(attIdx);

    // Attendance rows are sorted by date ascending
    const attBlock = capturedCsv.slice(attIdx, remIdx);
    const dateLines = attBlock
      .split("\n")
      .filter((l) => /^\d{4}-\d{2}-\d{2},/.test(l))
      .map((l) => l.split(",")[0]);
    expect(dateLines).toEqual(["2025-01-01", "2025-01-02", "2025-01-03"]);

    // Remark rows: tag label (not raw enum) and quoted text with escaped quotes
    expect(capturedCsv).toContain("Appreciation");
    expect(capturedCsv).toContain('"Said ""hi"""');
  });

  it("teacher cannot trigger CSV (menu item not rendered)", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    expect(screen.queryByText(/download csv/i)).not.toBeInTheDocument();
  });
});

describe("StudentExportActions — error states", () => {
  it("shows error toast when CSV blob construction fails", async () => {
    const user = userEvent.setup();
    const BlobOrig = global.Blob;
    // @ts-expect-error force constructor failure
    global.Blob = function () { throw new Error("blob fail"); };

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));

    expect(toastMock.error).toHaveBeenCalledWith("Failed to generate CSV");
    expect(toastMock.success).not.toHaveBeenCalled();

    global.Blob = BlobOrig;
  });

  it("falls back to HTML with warning toast when jsPDF throws", async () => {
    const user = userEvent.setup();
    pdfState.shouldThrow = true;

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));

    await act(async () => { await Promise.resolve(); });

    expect(pdfSaveMock).not.toHaveBeenCalled();
    expect(toastMock.warning).toHaveBeenCalledWith(
      "PDF generation failed — downloaded HTML report as fallback",
    );
    // HTML fallback was downloaded
    expect(capturedCsv).toContain("<!DOCTYPE html>");
    expect(capturedCsv).toContain("Asha Kumar");
  });

  it("shows hard error toast when both PDF and HTML fallback fail", async () => {
    const user = userEvent.setup();
    pdfState.shouldThrow = true;
    const BlobOrig = global.Blob;
    // @ts-expect-error force fallback failure too
    global.Blob = function () { throw new Error("blob fail"); };

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));

    expect(toastMock.error).toHaveBeenCalledWith("Failed to generate report");

    global.Blob = BlobOrig;
  });

  it("PDF success path saves file and toasts success", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));

    expect(pdfSaveMock).toHaveBeenCalledWith("Asha_Kumar_report.pdf");
    expect(toastMock.success).toHaveBeenCalledWith("PDF downloaded");
  });
});

describe("StudentExportActions — remarks edits flow into exports immediately", () => {
  it("CSV reflects updated remark list passed via props (admin)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StudentExportActions {...baseProps} role="admin" />);

    // First export — original remarks
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
    await act(async () => { await Promise.resolve(); });
    expect(capturedCsv).toContain("Great work");
    expect(capturedCsv).not.toContain("Needs improvement");

    // Simulate an inline edit: parent re-renders with updated remarks
    const updated: StudentRemark[] = [
      ...remarks,
      { id: "3", text: "Needs improvement", date: "2025-01-04T10:00:00.000Z", tag: "improvement" },
    ];
    rerender(<StudentExportActions {...baseProps} role="admin" remarks={updated} />);

    capturedCsv = "";
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
    await act(async () => { await Promise.resolve(); });

    expect(capturedCsv).toContain("Needs improvement");
    expect(capturedCsv).toContain("Improvement"); // tag label
  });

  it("PDF generation receives updated remarks for teacher role", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));
    expect(pdfSaveMock).toHaveBeenCalledTimes(1);

    const updated: StudentRemark[] = [
      { id: "9", text: "Updated note", date: "2025-01-05T10:00:00.000Z", tag: "concern" },
    ];
    rerender(<StudentExportActions {...baseProps} role="teacher" remarks={updated} />);

    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));
    expect(pdfSaveMock).toHaveBeenCalledTimes(2);
    // Teachers still cannot CSV
    await openMenu(user);
    expect(screen.queryByText(/download csv/i)).not.toBeInTheDocument();
  });
});
