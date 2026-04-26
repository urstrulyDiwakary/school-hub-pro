import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentExportActions from "./StudentExportActions";
import type { AttendanceStatus } from "@/data/teacherData";
import type { StudentRemark } from "./types";
import type { StudentStats } from "./useStudentDetailData";
import { expectExportToast } from "@/test/exportToastAssertions";

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

const RealBlob = global.Blob;

beforeEach(() => {
  capturedCsv = "";
  pdfState.shouldThrow = false;
  vi.clearAllMocks();

  // Wrap Blob to capture text content synchronously
  global.Blob = function (parts: BlobPart[], opts?: BlobPropertyBag) {
    try {
      capturedCsv = (parts ?? []).map((p) => (typeof p === "string" ? p : "")).join("");
    } catch { /* ignore */ }
    return new RealBlob(parts, opts);
  } as unknown as typeof Blob;

  URL.createObjectURL = vi.fn(() => "blob:mock") as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
    downloadBlobSpy();
  });
});

afterEach(() => {
  global.Blob = RealBlob;
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
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

    expectExportToast(toastMock, "csvSuccess");

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

    expectExportToast(toastMock, "csvFailure");

    global.Blob = BlobOrig;
  });

  it("falls back to HTML with warning toast when jsPDF throws", async () => {
    const user = userEvent.setup();
    pdfState.shouldThrow = true;

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));

    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

    expect(pdfSaveMock).not.toHaveBeenCalled();
    expectExportToast(toastMock, "pdfFallbackWarning");
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

    expectExportToast(toastMock, "pdfHardFailure");

    global.Blob = BlobOrig;
  });

  it("PDF success path saves file and toasts success", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download pdf/i }));

    expect(pdfSaveMock).toHaveBeenCalledWith("Asha_Kumar_report.pdf");
    expectExportToast(toastMock, "pdfSuccess");
  });
});

describe("StudentExportActions — remarks edits flow into exports immediately", () => {
  it("CSV reflects updated remark list passed via props (admin)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StudentExportActions {...baseProps} role="admin" />);

    // First export — original remarks
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
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
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

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

// -------------------------------------------------------------------------
// Snapshot tests — lock CSV header + attendance/remarks column order/format
// -------------------------------------------------------------------------

describe("StudentExportActions — CSV snapshots (locked format)", () => {
  it("admin CSV matches snapshot (header + attendance + remarks columns/order)", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

    expect(capturedCsv).toMatchInlineSnapshot(`
      "Student Attendance & Remarks Report
      Student,Asha Kumar
      Roll No,12
      Attendance Rate,80%
      Present,8
      Absent,1
      Late,1
      Total Days,10

      Date,Status
      2025-01-01,present
      2025-01-02,absent
      2025-01-03,present

      Remarks
      Date,Tag,Remark
      2025-01-02 10:00,Appreciation,Great work
      2025-01-03 10:00,General,"Said ""hi"""
      "
    `);
  });

  it("teacher cannot generate CSV at all (snapshot stays empty)", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    // CSV menu item must not exist for teachers — guard at render time.
    expect(screen.queryByRole("menuitem", { name: /download csv/i })).toBeNull();
    expect(capturedCsv).toMatchInlineSnapshot(`""`);
  });
});

// -------------------------------------------------------------------------
// Route-aware guard tests — CSV stays hidden on teacher routes regardless
// of props or UI state manipulation.
// -------------------------------------------------------------------------

describe("StudentExportActions — route-aware guard", () => {
  const originalLocation = window.location;
  const setPath = (pathname: string) => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, pathname },
    });
  };
  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("CSV is hidden on /teacher/* even when role='admin' prop is forced", async () => {
    setPath("/teacher/dashboard");
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(screen.queryByRole("menuitem", { name: /download csv/i })).toBeNull();
    expect(screen.getByRole("menuitem", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("CSV is shown on admin routes when role='admin'", async () => {
    setPath("/dashboard");
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(screen.getByRole("menuitem", { name: /download csv/i })).toBeInTheDocument();
  });

  it("CSV is hidden on admin routes when role='teacher' (stricter wins)", async () => {
    setPath("/dashboard");
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    expect(screen.queryByRole("menuitem", { name: /download csv/i })).toBeNull();
  });
});

// -------------------------------------------------------------------------
// HTML fallback as an explicit, configurable export option.
// -------------------------------------------------------------------------

describe("StudentExportActions — HTML option (gated by config)", () => {
  beforeEach(() => {
    // Reset any per-school config from previous suites so we test the
    // hardcoded defaults: admin + teacher both have htmlFallback enabled.
    window.localStorage.clear();
  });

  it("admin sees HTML option (default config enables htmlFallback)", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(await screen.findByRole("menuitem", { name: /download html/i })).toBeInTheDocument();
  });

  it("teacher sees HTML option (default config enables htmlFallback)", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="teacher" />);
    await openMenu(user);
    expect(await screen.findByRole("menuitem", { name: /download html/i })).toBeInTheDocument();
  });

  it("clicking HTML downloads an HTML report and toasts success", async () => {
    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download html/i }));
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith("HTML downloaded"));
    expect(capturedCsv).toContain("<!DOCTYPE html>");
    expect(capturedCsv).toContain("Asha Kumar");
  });

  it("HTML option is hidden when school config disables htmlFallback for the role", async () => {
    // Disable htmlFallback for admin via the school config store.
    const cfg = {
      enabled: {
        admin: { csv: true, pdf: true, htmlFallback: false },
        teacher: { csv: false, pdf: true, htmlFallback: true },
      },
      defaultFormat: { admin: "csv", teacher: "pdf" },
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem("school-export-config:v1", JSON.stringify(cfg));

    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(screen.queryByRole("menuitem", { name: /download html/i })).toBeNull();
    // CSV + PDF still visible
    expect(screen.getByRole("menuitem", { name: /download csv/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("HTML option hidden on /teacher/* if config disables it for teacher", async () => {
    const cfg = {
      enabled: {
        admin: { csv: true, pdf: true, htmlFallback: true },
        teacher: { csv: false, pdf: true, htmlFallback: false },
      },
      defaultFormat: { admin: "csv", teacher: "pdf" },
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem("school-export-config:v1", JSON.stringify(cfg));

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, pathname: "/teacher/dashboard" },
    });

    const user = userEvent.setup();
    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    expect(screen.queryByRole("menuitem", { name: /download html/i })).toBeNull();

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});

// -------------------------------------------------------------------------
// Error UI with retry button.
// -------------------------------------------------------------------------

describe("StudentExportActions — error UI with retry", () => {
  it("shows an inline error alert with a Retry button after CSV failure", async () => {
    const user = userEvent.setup();
    const BlobOrig = global.Blob;
    // @ts-expect-error force constructor failure
    global.Blob = function () { throw new Error("blob fail"); };

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/export failed/i);
    expect(alert).toHaveTextContent(/failed to generate csv/i);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();

    global.Blob = BlobOrig;
  });

  it("Retry re-runs the last failed export and clears the alert on success", async () => {
    const user = userEvent.setup();
    const BlobOrig = global.Blob;
    let firstCall = true;
    // Fail once, succeed on retry.
    global.Blob = function (parts: BlobPart[], opts?: BlobPropertyBag) {
      if (firstCall) { firstCall = false; throw new Error("blob fail"); }
      capturedCsv = (parts ?? []).map((p) => (typeof p === "string" ? p : "")).join("");
      return new BlobOrig(parts, opts);
    } as unknown as typeof Blob;

    render(<StudentExportActions {...baseProps} role="admin" />);
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /download csv/i }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith("CSV downloaded"));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(capturedCsv).toContain("Student,Asha Kumar");

    global.Blob = BlobOrig;
  });
});
