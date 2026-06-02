import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Users,
  Calendar,
  PieChart,
  ScrollText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  payrollData,
  filterPayroll,
  summarizePayroll,
  expenseBreakdown,
  comparePayrollToPreviousMonth,
  formatINR,
  formatCompactINR,
  grossPay,
  netPay,
  MONTH_LABELS,
  type PayrollMonth,
  type PayrollTypeFilter,
  type MetricDelta,
} from "@/data/payrollData";

export default function Payroll() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<PayrollMonth>("october");
  const [filterType, setFilterType] = useState<PayrollTypeFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const monthFiltered = filterPayroll(payrollData, filterType, selectedMonth);
  const filteredPayroll = monthFiltered.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.employeeId.toLowerCase().includes(q)
    );
  });

  // Cards and the expense breakdown reconcile against the SAME summary so the
  // numbers can never drift apart from the table.
  const summary = summarizePayroll(filteredPayroll);
  const breakdown = expenseBreakdown(summary);
  const progressPct = summary.count
    ? Math.round((summary.paidCount / summary.count) * 100)
    : 0;

  // Month-over-month change vs the previous month, using the same type filter
  // so the comparison stays apples-to-apples.
  const comparison = comparePayrollToPreviousMonth(payrollData, selectedMonth, filterType);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "hold":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-active";
      case "pending":
        return "badge-pending";
      case "hold":
        return "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive";
      default:
        return "badge-inactive";
    }
  };

  const handleProcessPayroll = () => {
    toast({
      title: "Payroll Processing Started",
      description: "Salary disbursement is being processed for all pending staff.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-description">
            Process and manage staff salaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/payroll/audit">
              <ScrollText className="h-4 w-4" />
              Audit Report
            </Link>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={handleProcessPayroll}>
            <Wallet className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCompactINR(summary.totalNet)}</p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.paidCount}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.count}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Payroll Progress - {MONTH_LABELS[selectedMonth]}
            </span>
            <span className="text-sm font-medium text-primary">
              {progressPct}% Complete
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{summary.paidCount} paid</span>
            <span>{summary.pendingCount} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as PayrollMonth)}>
              <SelectTrigger className="w-full sm:w-40">
                <Calendar className="mr-2 h-4 w-4" />
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

      {/* Salary Expense Breakdown */}
      <Card className="stat-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Salary Expense Breakdown</h2>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                breakdown.reconciles
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {breakdown.reconciles ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {breakdown.reconciles ? "Reconciled" : "Mismatch"}
            </span>
          </div>

          <div className="space-y-4">
            {breakdown.components.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{c.label}</span>
                  <span className="text-muted-foreground">
                    {formatINR(c.amount)}{" "}
                    <span className="text-xs">({c.percent.toFixed(1)}%)</span>
                  </span>
                </div>
                <Progress value={c.percent} className="h-2" />
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Gross Expense</p>
              <p className="text-lg font-bold text-foreground">{formatINR(summary.totalGross)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Total Deductions</p>
              <p className="text-lg font-bold text-destructive">-{formatINR(summary.totalDeductions)}</p>
            </div>
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">Net Payroll</p>
              <p className="text-lg font-bold text-primary">{formatINR(summary.totalNet)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Components ({formatINR(breakdown.componentSum)}) reconcile to the Gross Expense and the
            Total Payroll card ({formatINR(summary.totalNet)} after deductions).
          </p>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison */}
      <Card className="stat-card">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Month-over-Month Comparison</h2>
          </div>
          {comparison.hasPrevious && comparison.previousMonth ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {MONTH_LABELS[selectedMonth]} vs {MONTH_LABELS[comparison.previousMonth]}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <ComparisonCell label="Total Payroll" metric={comparison.totalNet} positiveIsGood />
                <ComparisonCell label="Total Deductions" metric={comparison.totalDeductions} positiveIsGood={false} />
                <ComparisonCell label="Gross Expense" metric={comparison.totalGross} positiveIsGood />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No earlier month is available to compare {MONTH_LABELS[selectedMonth]} against.
            </p>
          )}
        </CardContent>
      </Card>


      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-medium",
                            item.type === "Teaching"
                              ? "bg-success/10 text-success"
                              : "bg-info/10 text-info"
                          )}
                        >
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.employeeId} • {item.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{formatINR(item.basicSalary)}</td>
                  <td>{formatINR(item.hra)}</td>
                  <td className="text-success">+{formatINR(item.allowances)}</td>
                  <td className="font-medium">{formatINR(grossPay(item))}</td>
                  <td className="text-destructive">-{formatINR(item.deductions)}</td>
                  <td className="font-semibold">{formatINR(netPay(item))}</td>
                  <td>
                    <span className={cn("flex items-center gap-1", getStatusBadge(item.status))}>
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Payslip
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayroll.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No payroll records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t bg-muted/30 px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {summary.count} staff members
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-muted-foreground">
                Gross: <span className="font-medium text-foreground">{formatINR(summary.totalGross)}</span>
              </span>
              <span className="text-muted-foreground">
                Deductions: <span className="font-medium text-destructive">-{formatINR(summary.totalDeductions)}</span>
              </span>
              <span className="text-lg font-bold text-foreground">
                Total: {formatINR(summary.totalNet)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ComparisonCell({
  label,
  metric,
  positiveIsGood,
}: {
  label: string;
  metric: MetricDelta;
  positiveIsGood: boolean;
}) {
  const up = metric.change > 0;
  const flat = metric.change === 0;
  // Whether the direction of change is "good" (green) or "bad" (red).
  const good = flat ? null : up === positiveIsGood;
  const toneClass = good === null ? "text-muted-foreground" : good ? "text-success" : "text-destructive";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const sign = up ? "+" : metric.change < 0 ? "-" : "";

  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{formatINR(metric.current)}</p>
      <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", toneClass)}>
        <Icon className="h-3.5 w-3.5" />
        <span>
          {sign}
          {formatINR(Math.abs(metric.change))}
        </span>
        <span className="text-muted-foreground">
          ({metric.percent >= 0 ? "+" : ""}
          {metric.percent.toFixed(1)}%)
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        prev {formatINR(metric.previous)}
      </p>
    </div>
  );
}

