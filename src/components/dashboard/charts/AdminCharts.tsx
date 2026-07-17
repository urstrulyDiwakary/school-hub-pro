import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisTick = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const axisLine = { stroke: "hsl(var(--border))" };
const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 4px 12px hsl(220 20% 10% / 0.08)",
  fontSize: "12px",
};

export function FeeCollectionChart({
  data,
}: {
  data: { month: string; collected: number; pending: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="d-collected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="d-pending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={axisTick} axisLine={axisLine} />
        <YAxis tick={axisTick} axisLine={axisLine} tickFormatter={(v) => `₹${v}L`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v}L`, ""]} />
        <Area type="monotone" dataKey="collected" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#d-collected)" name="Collected" />
        <Area type="monotone" dataKey="pending" stroke="hsl(var(--warning))" strokeWidth={2} fill="url(#d-pending)" name="Pending" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StudentsByClassChart({
  data,
}: {
  data: { class: string; students: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="class" tick={{ ...axisTick, fontSize: 10 }} axisLine={axisLine} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={axisTick} axisLine={axisLine} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceTrendChart({
  data,
}: {
  data: { day: string; students: number; staff: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="d-students" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="d-staff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="day" tick={axisTick} axisLine={axisLine} />
        <YAxis domain={[85, 100]} tick={axisTick} axisLine={axisLine} tickFormatter={(v) => `${v}%`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, ""]} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Area type="monotone" dataKey="students" name="Students" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#d-students)" />
        <Area type="monotone" dataKey="staff" name="Staff" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#d-staff)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GenderDistributionChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
          {data.map((e, i) => (
            <Cell key={i} fill={e.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}
