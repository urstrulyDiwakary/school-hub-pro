import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}
function ChartCard({ title, children }: ChartCardProps) {
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

export function AttendanceTrendChart({
  data,
}: {
  data: { month: string; percentage: number }[];
}) {
  return (
    <ChartCard title="Monthly Attendance Trend">
      <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Attendance"]} />
        <Area
          type="monotone"
          dataKey="percentage"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#attGrad)"
        />
      </AreaChart>
    </ChartCard>
  );
}

const PIE_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export function AttendancePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ChartCard title="Attendance Breakdown">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartCard>
  );
}

export function ResultsProgressChart({
  data,
}: {
  data: { exam: string; percentage: number }[];
}) {
  return (
    <ChartCard title="Performance Trend">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <XAxis dataKey="exam" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Percentage"]} />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="hsl(var(--success))"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartCard>
  );
}

export function SubjectMarksChart({
  data,
}: {
  data: { subject: string; marks: number }[];
}) {
  return (
    <ChartCard title="Subject-wise Marks (Latest)">
      <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <XAxis dataKey="subject" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="marks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
