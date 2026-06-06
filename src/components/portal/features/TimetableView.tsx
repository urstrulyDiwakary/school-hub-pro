import { Card, CardContent } from "@/components/ui/card";
import { timetable } from "@/data/portal/academics";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TimetableView() {
  return (
    <Card>
      <CardContent className="scroll-x-mobile p-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((period) => {
              const time = timetable.find((s) => s.period === period + 1)?.time ?? "";
              return (
                <tr key={period}>
                  <td className="whitespace-nowrap font-medium">{time}</td>
                  {DAYS.map((day) => {
                    const slot = timetable.find((s) => s.day === day && s.period === period + 1);
                    return (
                      <td key={day}>
                        {slot ? (
                          <div>
                            <p className="font-medium text-foreground">{slot.subject}</p>
                            <p className="text-xs text-muted-foreground">{slot.room}</p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
