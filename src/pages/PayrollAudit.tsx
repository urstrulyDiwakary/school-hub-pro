import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Download, ScrollText, Clock } from "lucide-react";
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
import {
  payrollData,
  filterPayroll,
  summarizePayroll,
  formatINR,
  grossPay,
  netPay,
  MONTH_LABELS,
  type PayrollMonth,
  type PayrollTypeFilter,
} from "@/data/payrollData";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  hold: "destructive",
};

export default function PayrollAudit() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<PayrollMonth>("october");
  const [filterType, setFilterType] = useState<PayrollTypeFilter>("all");

  // Single timestamp captured when the report is computed/generated.
  const generatedAt = useMemo(() => new Date(), [selectedMonth, filterType]);

  const records = filterPayroll(payrollData, filterType, selectedMonth);
  const summary = summarizePayroll(records);

  const handleExport = () => {
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
    link.download = `payroll-audit-${selectedMonth}-${format(generatedAt, "yyyyMMdd-HHmmss")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Audit report exported",
      description: `${records.length} records exported with computed totals.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <div className="mb-1 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1 px-2" asChild>
              <Link to="/payroll">
                <ArrowLeft className="h-4 w-4" />
                Payroll
              </Link>
            </Button>
          </div>
          <h1 className="page-title flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Payroll Audit Report
          </h1>
          <p className="page-description">
            Per-employee gross, deductions and net pay with reconciled computed totals.
          </p>
        </div>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Meta + filters */}
      <Card className="stat-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
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
