// Shared recharts visualisations for the examination module.
// All colors come from semantic design tokens (HSL) for light/dark support.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PassPercentageChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ChartCard title="Pass Percentage by Class">
      <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Pass %"]} />
        <Bar dataKey="value" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function SubjectPerformanceChart({ data }: { data: { subject: string; average: number }[] }) {
  return (
    <ChartCard title="Subject Performance">
      <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="subject" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Average"]} />
        <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function ClassComparisonChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ChartCard title="Class Comparison (Avg %)">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <YAxis type="category" dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={70} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Average"]} />
        <Bar dataKey="value" fill="hsl(var(--info))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function MonthlyActivityChart({ data }: { data: { month: string; exams: number }[] }) {
  return (
    <ChartCard title="Monthly Exam Activity">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="exams" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ChartCard>
  );
}

export function GradeDistributionChart({ data }: { data: { grade: string; count: number }[] }) {
  return (
    <ChartCard title="Grade Distribution">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="grade" innerRadius={50} outerRadius={85} paddingAngle={3} label={({ grade }) => grade}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartCard>
  );
}
