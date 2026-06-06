import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { calendarEvents, type CalendarEvent } from "@/data/portal/academics";
import { cn } from "@/lib/utils";

const typeMeta: Record<CalendarEvent["type"], string> = {
  exam: "bg-destructive/10 text-destructive",
  holiday: "bg-success/10 text-success",
  event: "bg-info/10 text-info",
  activity: "bg-warning/10 text-warning",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

export function CalendarView() {
  const events = [...calendarEvents].sort((a, b) => (a.date < b.date ? -1 : 1));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" /> Academic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-center">
                <span className="text-sm font-bold leading-none">{new Date(e.date).getDate()}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}</span>
              </span>
              <div>
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{fmt(e.date)}</p>
              </div>
            </div>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", typeMeta[e.type])}>
              {e.type}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
