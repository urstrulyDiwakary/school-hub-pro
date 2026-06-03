import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, Download, FileText, ScrollText, Clock, ShieldCheck, UserCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MONTH_LABELS,
  CURRENT_TEACHER_EMPLOYEE_ID,
  type PayrollMonth,
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

export default function PayrollAudit() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<PayrollMonth>("october");
  const [filterType, setFilterType] = useState<PayrollTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>("all");

  // Role decides what slice of the data is even available. Admins see the full
  // school report; teachers can only ever see their own payroll records.
  const role = getCurrentRole();
  const isAdmin = role === "admin";

  // Single timestamp captured when the report is computed/generated.
  const generatedAt = useMemo(
    () => new Date(),
    [selectedMonth, filterType, statusFilter],
  );

  // 1) scope to role  2) month + type filter  3) net-pay status filter.
  const roleScoped = useMemo(() => scopeRecordsForRole(payrollData, role), [role]);
  const records = filterByStatus(
    filterPayroll(roleScoped, isAdmin ? filterType : "all", selectedMonth),
    statusFilter,
  );
  const summary = summarizePayroll(records);

  const exportFilename = (ext: string) =>
    `payroll-audit-${selectedMonth}-${format(generatedAt, "yyyyMMdd-HHmmss")}.${ext}`;

  const handleExportCsv = () => {
    const header = [
      "Employee ID",
      "Name",
      "Type",
      "Month",
      "Gross",
      "Deductions",
      "Net Pay",
      "Status",
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
      generatedAt.toISOString(),
    ]);
    const csv = [header, ...rows]
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
      description: `${records.length} records exported to CSV with computed totals.`,
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
      head: [["Employee", "ID", "Type", "Month", "Gross", "Deductions", "Net Pay", "Status"]],
      body: records.map((r) => [
        r.name,
        r.employeeId,
        r.type,
        MONTH_LABELS[r.month],
        formatINR(grossPay(r)),
        `-${formatINR(r.deductions)}`,
        formatINR(netPay(r)),
        r.status,
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
              <TableHead>Status</TableHead>
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
                  <Badge variant={statusVariant[r.status]} className="capitalize">
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </div>
  );
}
