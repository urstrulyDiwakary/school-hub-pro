import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { AttendanceRecord } from "@/data/teacherData";

interface AttendanceTrendChartProps {
  filteredRecords: AttendanceRecord[];
}

export default function AttendanceTrendChart({ filteredRecords }: AttendanceTrendChartProps) {
  const chartData = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record) => {
        const total = record.records.length;
        const present = record.records.filter((r) => r.status === "present").length;
        const absent = record.records.filter((r) => r.status === "absent").length;
        const late = record.records.filter((r) => r.status === "late").length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          date: format(parseISO(record.date), "MMM dd"),
          fullDate: format(parseISO(record.date), "EEEE, MMM dd"),
          rate,
          present,
          absent,
          late,
          total,
        };
      });
  }, [filteredRecords]);

  if (chartData.length === 0) return null;

  return (
    <Card className="stat-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Daily Attendance Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[200px] sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAttendanceRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px hsl(220 20% 10% / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { rate: "Attendance", present: "Present", absent: "Absent", late: "Late" };
                  return [name === "rate" ? `${value}%` : value, labels[name] || name];
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.date === label);
                  return item?.fullDate || label;
                }}
              />
              <ReferenceLine
                y={75}
                stroke="hsl(0, 84%, 60%)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: "75% threshold", position: "insideTopRight", fontSize: 10, fill: "hsl(0, 84%, 60%)" }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(234, 89%, 54%)"
                strokeWidth={2.5}
                fill="url(#colorAttendanceRate)"
                name="rate"
                dot={{ r: 4, fill: "hsl(234, 89%, 54%)", strokeWidth: 2, stroke: "hsl(0, 0%, 100%)" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>Attendance Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-destructive" />
            <span>75% Threshold</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
