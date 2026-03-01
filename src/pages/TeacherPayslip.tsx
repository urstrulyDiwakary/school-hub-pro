import { useRef } from "react";
import { useState } from "react";
import { format } from "date-fns";
import {
  Download,
  Printer,
  FileText,
  IndianRupee,
  Briefcase,
  Calendar,
} from "lucide-react";
import YtdSalarySummary from "@/components/teacher/YtdSalarySummary";
import TaxComputationBreakdown from "@/components/teacher/TaxComputationBreakdown";
import MonthlySalaryTrendChart from "@/components/teacher/MonthlySalaryTrendChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { teacherPayslipData, payslipMonths } from "@/data/teacherData";

export default function TeacherPayslip() {
  const [selectedMonth, setSelectedMonth] = useState("january-2026");
  const printRef = useRef<HTMLDivElement>(null);
  const data = teacherPayslipData;

  const totalEarnings =
    data.basicSalary +
    data.hra +
    data.da +
    data.medicalAllowance +
    data.transportAllowance +
    data.specialAllowance;

  const totalDeductions =
    data.pfDeduction +
    data.taxDeduction +
    data.professionalTax +
    data.loanDeduction +
    data.leaveDeduction;

  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${data.name} - ${data.month} ${data.year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #1a1a2e; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #4338ca; padding-bottom: 16px; }
          .header h1 { font-size: 20px; color: #4338ca; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 13px; }
          .info-grid .label { color: #666; }
          .info-grid .value { font-weight: 600; }
          .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          .salary-table th { background: #f5f5ff; padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid #e5e5e5; }
          .salary-table td { padding: 8px 12px; border: 1px solid #e5e5e5; }
          .salary-table .amount { text-align: right; font-family: monospace; }
          .total-row { background: #f8f9fa; font-weight: 700; }
          .net-row { background: #4338ca; color: white; font-weight: 700; font-size: 15px; }
          .net-row td { border-color: #4338ca; }
          .footer { margin-top: 32px; font-size: 11px; color: #999; text-align: center; }
          .columns { display: flex; gap: 24px; }
          .columns > div { flex: 1; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EduTrack Pro School</h1>
          <p>123 Education Lane, Knowledge City • Ph: +91-XX-XXXX-XXXX</p>
          <p style="margin-top:8px;font-size:14px;font-weight:600;">SALARY SLIP — ${data.month.toUpperCase()} ${data.year}</p>
        </div>
        <div class="info-grid">
          <div><span class="label">Employee ID: </span><span class="value">${data.employeeId}</span></div>
          <div><span class="label">Name: </span><span class="value">${data.name}</span></div>
          <div><span class="label">Designation: </span><span class="value">${data.designation}</span></div>
          <div><span class="label">Department: </span><span class="value">${data.department}</span></div>
          <div><span class="label">Bank A/C: </span><span class="value">${data.bankAccount}</span></div>
          <div><span class="label">PAN: </span><span class="value">${data.panNumber}</span></div>
          <div><span class="label">Working Days: </span><span class="value">${data.totalWorkingDays}</span></div>
          <div><span class="label">Days Worked: </span><span class="value">${data.daysWorked} (Leave: ${data.leaveTaken})</span></div>
        </div>
        <div class="columns">
          <div>
            <table class="salary-table">
              <thead><tr><th colspan="2">Earnings</th></tr></thead>
              <tbody>
                <tr><td>Basic Salary</td><td class="amount">${formatCurrency(data.basicSalary)}</td></tr>
                <tr><td>HRA</td><td class="amount">${formatCurrency(data.hra)}</td></tr>
                <tr><td>Dearness Allowance</td><td class="amount">${formatCurrency(data.da)}</td></tr>
                <tr><td>Medical Allowance</td><td class="amount">${formatCurrency(data.medicalAllowance)}</td></tr>
                <tr><td>Transport Allowance</td><td class="amount">${formatCurrency(data.transportAllowance)}</td></tr>
                <tr><td>Special Allowance</td><td class="amount">${formatCurrency(data.specialAllowance)}</td></tr>
                <tr class="total-row"><td>Total Earnings</td><td class="amount">${formatCurrency(totalEarnings)}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <table class="salary-table">
              <thead><tr><th colspan="2">Deductions</th></tr></thead>
              <tbody>
                <tr><td>Provident Fund</td><td class="amount">${formatCurrency(data.pfDeduction)}</td></tr>
                <tr><td>Income Tax (TDS)</td><td class="amount">${formatCurrency(data.taxDeduction)}</td></tr>
                <tr><td>Professional Tax</td><td class="amount">${formatCurrency(data.professionalTax)}</td></tr>
                <tr><td>Loan Recovery</td><td class="amount">${formatCurrency(data.loanDeduction)}</td></tr>
                <tr><td>Leave Deduction</td><td class="amount">${formatCurrency(data.leaveDeduction)}</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="total-row"><td>Total Deductions</td><td class="amount">${formatCurrency(totalDeductions)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <table class="salary-table" style="margin-top:8px;">
          <tbody>
            <tr class="net-row"><td>NET SALARY</td><td class="amount">${formatCurrency(netSalary)}</td></tr>
          </tbody>
        </table>
        <div class="footer">
          <p>This is a system-generated payslip and does not require a signature.</p>
          <p>Generated on ${format(new Date(), "PPP")}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    // Use print-to-PDF as the PDF generation method
    handlePrint();
    toast.success("Use 'Save as PDF' in the print dialog to download");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">My Payslip</h1>
          <p className="page-description">
            View and download your monthly salary details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {payslipMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <IndianRupee className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalEarnings)}
                </p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <IndianRupee className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalDeductions)}
                </p>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(netSalary)}
                </p>
                <p className="text-sm text-muted-foreground">Net Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Briefcase className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {data.daysWorked}/{data.totalWorkingDays}
                </p>
                <p className="text-sm text-muted-foreground">Days Worked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payslip Detail */}
      <div ref={printRef}>
        {/* Employee Info */}
        <Card className="stat-card mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Employee ID</p>
                <p className="font-medium text-foreground">{data.employeeId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{data.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Designation</p>
                <p className="font-medium text-foreground">{data.designation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">{data.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank Account</p>
                <p className="font-medium text-foreground">{data.bankAccount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PAN Number</p>
                <p className="font-medium text-foreground">{data.panNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Working Days</p>
                <p className="font-medium text-foreground">{data.totalWorkingDays}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Leave Taken</p>
                <p className="font-medium text-foreground">{data.leaveTaken} day(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings & Deductions */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Earnings */}
          <Card className="stat-card overflow-hidden">
            <CardHeader className="pb-3 bg-success/5">
              <CardTitle className="text-base text-success">Earnings</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td className="text-right font-medium">{formatCurrency(data.basicSalary)}</td>
                  </tr>
                  <tr>
                    <td>House Rent Allowance (HRA)</td>
                    <td className="text-right font-medium">{formatCurrency(data.hra)}</td>
                  </tr>
                  <tr>
                    <td>Dearness Allowance (DA)</td>
                    <td className="text-right font-medium">{formatCurrency(data.da)}</td>
                  </tr>
                  <tr>
                    <td>Medical Allowance</td>
                    <td className="text-right font-medium">{formatCurrency(data.medicalAllowance)}</td>
                  </tr>
                  <tr>
                    <td>Transport Allowance</td>
                    <td className="text-right font-medium">{formatCurrency(data.transportAllowance)}</td>
                  </tr>
                  <tr>
                    <td>Special Allowance</td>
                    <td className="text-right font-medium">{formatCurrency(data.specialAllowance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-t bg-success/5 px-4 py-3 flex justify-between">
              <span className="font-semibold text-foreground">Total Earnings</span>
              <span className="font-bold text-success">{formatCurrency(totalEarnings)}</span>
            </div>
          </Card>

          {/* Deductions */}
          <Card className="stat-card overflow-hidden">
            <CardHeader className="pb-3 bg-destructive/5">
              <CardTitle className="text-base text-destructive">Deductions</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Provident Fund (PF)</td>
                    <td className="text-right font-medium">{formatCurrency(data.pfDeduction)}</td>
                  </tr>
                  <tr>
                    <td>Income Tax (TDS)</td>
                    <td className="text-right font-medium">{formatCurrency(data.taxDeduction)}</td>
                  </tr>
                  <tr>
                    <td>Professional Tax</td>
                    <td className="text-right font-medium">{formatCurrency(data.professionalTax)}</td>
                  </tr>
                  <tr>
                    <td>Loan Recovery</td>
                    <td className="text-right font-medium">{formatCurrency(data.loanDeduction)}</td>
                  </tr>
                  <tr>
                    <td>Leave Deduction</td>
                    <td className="text-right font-medium">{formatCurrency(data.leaveDeduction)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-t bg-destructive/5 px-4 py-3 flex justify-between">
              <span className="font-semibold text-foreground">Total Deductions</span>
              <span className="font-bold text-destructive">{formatCurrency(totalDeductions)}</span>
            </div>
          </Card>
        </div>

        {/* Net Salary */}
        <Card className="stat-card mt-4 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Salary Payable</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(netSalary)}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{data.month} {data.year}</p>
                <p className="text-xs mt-1">Credited to {data.bankAccount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Salary Trend */}
      <MonthlySalaryTrendChart />

      {/* YTD Summary & Tax Breakdown */}
      <YtdSalarySummary />
      <TaxComputationBreakdown />
    </div>
  );
}
