import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { teacherPayslipData } from "@/data/teacherData";

const base = teacherPayslipData;
const gross =
  base.basicSalary + base.hra + base.da + base.medicalAllowance + base.transportAllowance + base.specialAllowance;
const deductions =
  base.pfDeduction + base.taxDeduction + base.professionalTax + base.loanDeduction;

// Simulate monthly variation for FY 2025-26 (Apr 2025 – Jan 2026)
const monthlySalaryData = [
  { month: "Apr", gross, deductions: deductions + 1200, net: gross - deductions - 1200 },
  { month: "May", gross, deductions, net: gross - deductions },
  { month: "Jun", gross, deductions, net: gross - deductions },
  { month: "Jul", gross, deductions: deductions + 800, net: gross - deductions - 800 },
  { month: "Aug", gross, deductions, net: gross - deductions },
  { month: "Sep", gross, deductions, net: gross - deductions },
  { month: "Oct", gross, deductions: deductions + 3462, net: gross - deductions - 3462 },
  { month: "Nov", gross, deductions, net: gross - deductions },
  { month: "Dec", gross, deductions, net: gross - deductions },
  { month: "Jan", gross, deductions: deductions + base.leaveDeduction, net: gross - deductions - base.leaveDeduction },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function MonthlySalaryTrendChart() {
  return (
    <Card className="stat-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Monthly Net Salary Trend — FY 2025-26
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySalaryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 13,
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "net" ? "Net Salary" : name === "gross" ? "Gross" : "Deductions",
                ]}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke="hsl(var(--primary))"
                fill="url(#netGradient)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                name="net"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
