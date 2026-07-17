import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { SparkPoint, Tone } from "./types";

const toneStroke: Record<Tone, string> = {
  default: "hsl(var(--muted-foreground))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  info: "hsl(var(--info))",
};

export default function Sparkline({
  data,
  tone = "primary",
}: {
  data: SparkPoint[];
  tone?: Tone;
}) {
  const stroke = toneStroke[tone];
  const id = `spark-${tone}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
