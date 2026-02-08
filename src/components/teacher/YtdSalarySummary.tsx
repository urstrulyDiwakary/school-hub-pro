import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ytdSummaryData } from "@/data/teacherData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function YtdSalarySummary() {
  const d = ytdSummaryData;

  const earningsRows = [
    { label: "Basic Salary", value: d.totalBasic },
    { label: "House Rent Allowance", value: d.totalHRA },
    { label: "Dearness Allowance", value: d.totalDA },
    { label: "Medical Allowance", value: d.totalMedical },
    { label: "Transport Allowance", value: d.totalTransport },
    { label: "Special Allowance", value: d.totalSpecial },
  ];

  const deductionRows = [
    { label: "Provident Fund", value: d.totalPF },
    { label: "Income Tax (TDS)", value: d.totalTDS },
    { label: "Professional Tax", value: d.totalProfessionalTax },
    { label: "Loan Recovery", value: d.totalLoanRecovery },
    { label: "Leave Deduction", value: d.totalLeaveDeduction },
  ];

  return (
    <Card className="stat-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Year-to-Date Summary — FY {d.financialYear}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {d.monthsCounted} months (Apr–Jan)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Earnings column */}
          <div>
            <div className="px-4 py-2 bg-success/5 text-sm font-semibold text-success">
              Earnings
            </div>
            <div className="divide-y divide-border">
              {earningsRows.map((row) => (
                <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground font-mono">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-success/5">
                <span className="font-semibold text-foreground">Total Gross</span>
                <span className="font-bold text-success font-mono">
                  {formatCurrency(d.totalGrossEarnings)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions column */}
          <div>
            <div className="px-4 py-2 bg-destructive/5 text-sm font-semibold text-destructive">
              Deductions
            </div>
            <div className="divide-y divide-border">
              {deductionRows.map((row) => (
                <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground font-mono">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-destructive/5">
                <span className="font-semibold text-foreground">Total Deductions</span>
                <span className="font-bold text-destructive font-mono">
                  {formatCurrency(d.totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net YTD */}
        <div className="flex items-center justify-between px-4 py-4 bg-primary/5 border-t border-primary/20">
          <span className="font-semibold text-foreground">Net Salary Paid (YTD)</span>
          <span className="text-xl font-bold text-primary font-mono">
            {formatCurrency(d.totalNetPaid)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
