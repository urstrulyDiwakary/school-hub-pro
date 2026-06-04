import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  Download,
  FileText,
  ScrollText,
  Clock,
  ShieldCheck,
  UserCog,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  History,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCurrentRole } from "@/lib/userRole";
import {
  payrollData,
  filterPayroll,
  filterByStatus,
  scopeRecordsForRole,
  summarizePayroll,
  formatINR,
  grossPay,
  netPay,
  getStatusHistory,
  MONTH_LABELS,
  CURRENT_TEACHER_EMPLOYEE_ID,
  type PayrollMonth,
  type PayrollRecord,
  type PayrollStatus,
  type PayrollTypeFilter,
  type PayrollStatusFilter,
} from "@/data/payrollData";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  hold: "destructive",
};

const TYPE_LABELS: Record<PayrollTypeFilter, string> = {
  all: "All Staff",
  teaching: "Teaching",
  nonteaching: "Non-Teaching",
};

const STATUS_LABELS: Record<PayrollStatusFilter, string> = {
  all: "All Statuses",
  paid: "Paid",
  pending: "Pending",
  hold: "Hold",
};

/** Canonical "Last Updated" format shared by the table, modal, CSV and PDF. */
const LAST_UPDATED_FORMAT = "dd MMM, HH:mm";
const formatLastUpdated = (iso: string) => format(new Date(iso), LAST_UPDATED_FORMAT);

// Sorting -------------------------------------------------------------------
type SortKey = "status" | "lastUpdated";
type SortDir = "asc" | "desc";
/** Status order used when sorting the Status Timeline column. */
const STATUS_ORDER: Record<PayrollStatus, number> = { paid: 0, pending: 1, hold: 2 };

// Filter persistence --------------------------------------------------------
const FILTERS_STORAGE_KEY = "payroll-audit-filters";
interface PersistedFilters {
  selectedMonth: PayrollMonth;
  filterType: PayrollTypeFilter;
  statusFilter: PayrollStatusFilter;
  sortKey: SortKey | null;
  sortDir: SortDir;
}
const DEFAULT_FILTERS: PersistedFilters = {
  selectedMonth: "october",
  filterType: "all",
  statusFilter: "all",
  sortKey: null,
  sortDir: "desc",
};

function loadFilters(): PersistedFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...(JSON.parse(raw) as Partial<PersistedFilters>) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export default function PayrollAudit() {
  const { toast } = useToast();

  const initial = useMemo(loadFilters, []);
  const [selectedMonth, setSelectedMonth] = useState<PayrollMonth>(initial.selectedMonth);
  const [filterType, setFilterType] = useState<PayrollTypeFilter>(initial.filterType);
  const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>(initial.statusFilter);
  const [sortKey, setSortKey] = useState<SortKey | null>(initial.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir);
  const [historyRecord, setHistoryRecord] = useState<PayrollRecord | null>(null);
  const [search, setSearch] = useState("");

  // Role decides what slice of the data is even available. Admins see the full
  // school report; teachers can only ever see their own payroll records.
  const role = getCurrentRole();
  const isAdmin = role === "admin";

  // Persist filter + sort selections so they survive a refresh.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ selectedMonth, filterType, statusFilter, sortKey, sortDir }),
      );
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [selectedMonth, filterType, statusFilter, sortKey, sortDir]);

  // Single timestamp captured when the report is computed/generated.
  const generatedAt = useMemo(
    () => new Date(),
    [selectedMonth, filterType, statusFilter],
  );

  // 1) scope to role  2) month + type filter  3) net-pay status filter.
  const roleScoped = useMemo(() => scopeRecordsForRole(payrollData, role), [role]);
  const filteredRecords = filterByStatus(
    filterPayroll(roleScoped, isAdmin ? filterType : "all", selectedMonth),
    statusFilter,
  );

  // Apply column sorting (Status Timeline / Last Updated).
  const records = useMemo(() => {
    if (!sortKey) return filteredRecords;
    const sorted = [...filteredRecords].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "status") {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else {
        cmp = new Date(a.statusUpdatedAt).getTime() - new Date(b.statusUpdatedAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRecords, sortKey, sortDir]);

  const summary = summarizePayroll(records);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  // Active filter chips — only show filters that deviate from the default.
  interface FilterChip {
    key: string;
    label: string;
    onClear: () => void;
  }
  const activeChips: FilterChip[] = [];
  if (isAdmin && filterType !== "all") {
    activeChips.push({
      key: "type",
      label: `Type: ${TYPE_LABELS[filterType]}`,
      onClear: () => setFilterType("all"),
    });
  }
  if (statusFilter !== "all") {
    activeChips.push({
      key: "status",
      label: `Status: ${STATUS_LABELS[statusFilter]}`,
      onClear: () => setStatusFilter("all"),
    });
  }
  const hasActiveFilters = activeChips.length > 0;
  const clearAllFilters = () => {
    setFilterType("all");
    setStatusFilter("all");
  };

  const filtersSummary =
    `Month: ${MONTH_LABELS[selectedMonth]}` +
    ` | Type: ${isAdmin ? TYPE_LABELS[filterType] : "My records"}` +
    ` | Status: ${STATUS_LABELS[statusFilter]}`;

  const exportFilename = (ext: string) =>
    `payroll-audit-${selectedMonth}-${format(generatedAt, "yyyyMMdd-HHmmss")}.${ext}`;

  const handleExportCsv = () => {
    const metaRows = [
      ["Payroll Audit Report"],
      [`Filters: ${filtersSummary}`],
      [`Generated At: ${format(generatedAt, "dd MMM yyyy, HH:mm:ss")}`],
      [],
    ];
    const header = [
      "Employee ID",
      "Name",
      "Type",
      "Month",
      "Gross",
      "Deductions",
      "Net Pay",
      "Status Timeline",
      "Last Updated",
      "Generated At",
    ];
    const rows = records.map((r) => [
      r.employeeId,
      r.name,
      r.type,
      MONTH_LABELS[r.month],
      grossPay(r),
      r.deductions,
      netPay(r),
      r.status,
      formatLastUpdated(r.statusUpdatedAt),
      generatedAt.toISOString(),
    ]);
    rows.push([
      "",
      "TOTALS",
      "",
      "",
      summary.totalGross,
      summary.totalDeductions,
      summary.totalNet,
      `${summary.count} records`,
      "",
      generatedAt.toISOString(),
    ]);
    const csv = [...metaRows, header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename("csv");
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Audit report exported",
      description: `${records.length} records exported to CSV with filters, totals and timestamp.`,
    });
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;

    doc.setFontSize(16);
    doc.text("Payroll Audit Report", marginX, 48);

    doc.setFontSize(10);
    doc.setTextColor(110);
    const metaLines = [
      `Month: ${MONTH_LABELS[selectedMonth]}`,
      `Scope: ${isAdmin ? `${filterType === "all" ? "All staff" : filterType === "teaching" ? "Teaching" : "Non-Teaching"}` : "My records"}` +
        `  |  Status: ${statusFilter === "all" ? "All" : statusFilter}`,
      `Generated at: ${format(generatedAt, "dd MMM yyyy, HH:mm:ss")}`,
      `Viewing as: ${isAdmin ? "School Admin" : "Teacher"}`,
    ];
    metaLines.forEach((line, i) => doc.text(line, marginX, 70 + i * 14));
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 70 + metaLines.length * 14 + 8,
      head: [["Employee", "ID", "Type", "Month", "Gross", "Deductions", "Net Pay", "Status Timeline", "Last Updated"]],
      body: records.map((r) => [
        r.name,
        r.employeeId,
        r.type,
        MONTH_LABELS[r.month],
        formatINR(grossPay(r)),
        `-${formatINR(r.deductions)}`,
        formatINR(netPay(r)),
        r.status,
        formatLastUpdated(r.statusUpdatedAt),
      ]),
      foot: [
        [
          "Computed Totals",
          "",
          `${summary.count} records`,
          "",
          formatINR(summary.totalGross),
          `-${formatINR(summary.totalDeductions)}`,
          formatINR(summary.totalNet),
          "",
          "",
        ],
      ],
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [79, 70, 229] },
      footStyles: { fillColor: [238, 240, 252], textColor: 20, fontStyle: "bold" },
      theme: "striped",
    });

    doc.save(exportFilename("pdf"));
    toast({
      title: "Audit report exported",
      description: `${records.length} records exported to PDF with computed totals.`,
    });
  };

  const historyEntries = historyRecord ? getStatusHistory(historyRecord) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <div className="mb-1 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1 px-2" asChild>
              <Link to={isAdmin ? "/payroll" : "/teacher/payslip"}>
                <ArrowLeft className="h-4 w-4" />
                {isAdmin ? "Payroll" : "Payslip"}
              </Link>
            </Button>
          </div>
          <h1 className="page-title flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Payroll Audit Report
          </h1>
          <p className="page-description">
            {isAdmin
              ? "Per-employee gross, deductions and net pay with reconciled computed totals."
              : "Your personal payroll records with gross, deductions and net pay."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="gap-2" onClick={handleExportPdf}>
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Role banner */}
      <div
        className={
          "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm " +
          (isAdmin
            ? "border-primary/20 bg-primary/5 text-foreground"
            : "border-warning/30 bg-warning/10 text-foreground")
        }
      >
        {isAdmin ? (
          <ShieldCheck className="h-4 w-4 text-primary" />
        ) : (
          <UserCog className="h-4 w-4 text-warning" />
        )}
        {isAdmin ? (
          <span>
            <span className="font-medium">School Admin view</span> — full payroll audit across all
            staff.
          </span>
        ) : (
          <span>
            <span className="font-medium">Teacher view</span> — showing only your own records (
            {CURRENT_TEACHER_EMPLOYEE_ID}). Full school totals are restricted to admins.
          </span>
        )}
      </div>

      {/* Meta + filters */}
      <Card className="stat-card">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Generated at{" "}
            <span className="font-medium text-foreground">
              {format(generatedAt, "dd MMM yyyy, HH:mm:ss")}
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as PayrollMonth)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="october">October 2024</SelectItem>
                <SelectItem value="september">September 2024</SelectItem>
                <SelectItem value="august">August 2024</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <Select value={filterType} onValueChange={(v) => setFilterType(v as PayrollTypeFilter)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Staff Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="nonteaching">Non-Teaching</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PayrollStatusFilter)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Net-Pay Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {chip.label}
              <button
                type="button"
                aria-label={`Remove ${chip.label} filter`}
                onClick={chip.onClear}
                className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={clearAllFilters}>
            <X className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}


      {/* Audit table */}
      <Card className="stat-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("status")}
                  className="-ml-1 flex items-center gap-1 rounded px-1 py-0.5 font-medium transition-colors hover:text-foreground"
                  aria-label="Sort by status timeline"
                >
                  Status Timeline
                  <SortIcon column="status" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("lastUpdated")}
                  className="-ml-1 flex items-center gap-1 rounded px-1 py-0.5 font-medium transition-colors hover:text-foreground"
                  aria-label="Sort by last updated"
                >
                  Last Updated
                  <SortIcon column="lastUpdated" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.employeeId}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.type}</TableCell>
                <TableCell className="text-muted-foreground">{MONTH_LABELS[r.month]}</TableCell>
                <TableCell className="text-right">{formatINR(grossPay(r))}</TableCell>
                <TableCell className="text-right text-destructive">-{formatINR(r.deductions)}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(netPay(r))}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => setHistoryRecord(r)}
                    className="group flex items-center gap-1.5 rounded-md transition-opacity hover:opacity-80"
                    aria-label={`View status history for ${r.name}`}
                  >
                    <Badge variant={statusVariant[r.status]} className="w-fit capitalize">
                      {r.status}
                    </Badge>
                    <History className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatLastUpdated(r.statusUpdatedAt)}
                    <span className="text-muted-foreground/70">
                      ({formatDistanceToNow(new Date(r.statusUpdatedAt), { addSuffix: true })})
                    </span>
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No payroll records match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {records.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Computed Totals</TableCell>
                <TableCell colSpan={2} className="text-muted-foreground">
                  {summary.count} records
                </TableCell>
                <TableCell className="text-right font-bold">{formatINR(summary.totalGross)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  -{formatINR(summary.totalDeductions)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatINR(summary.totalNet)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>

      {/* Status history modal */}
      <Dialog open={historyRecord !== null} onOpenChange={(open) => !open && setHistoryRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Status Change History
            </DialogTitle>
            <DialogDescription>
              {historyRecord
                ? `${historyRecord.name} (${historyRecord.employeeId}) — ${MONTH_LABELS[historyRecord.month]}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ol className="relative space-y-4 border-l border-border pl-6">
            {historyEntries.map((entry, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.55rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  {entry.from ? (
                    <>
                      <Badge variant={statusVariant[entry.from]} className="capitalize">
                        {entry.from}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge variant={statusVariant[entry.to]} className="capitalize">
                        {entry.to}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">Created as</span>
                      <Badge variant={statusVariant[entry.to]} className="capitalize">
                        {entry.to}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(entry.at), "dd MMM yyyy, HH:mm")}
                  <span className="text-muted-foreground/70">
                    ({formatDistanceToNow(new Date(entry.at), { addSuffix: true })})
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
