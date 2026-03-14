import { Flame, Trophy } from "lucide-react";

interface StudentStatsCardsProps {
  stats: { present: number; absent: number; late: number; total: number; rate: number };
  currentStreak: number;
  longestStreak: number;
}

export default function StudentStatsCards({ stats, currentStreak, longestStreak }: StudentStatsCardsProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-2 mt-2">
        <div className="flex flex-col items-center rounded-lg border border-border/50 p-2.5">
          <span className="text-lg font-bold text-foreground">{stats.rate}%</span>
          <span className="text-[10px] text-muted-foreground">Rate</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-success/20 bg-success/5 p-2.5">
          <span className="text-lg font-bold text-success">{stats.present}</span>
          <span className="text-[10px] text-muted-foreground">Present</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
          <span className="text-lg font-bold text-destructive">{stats.absent}</span>
          <span className="text-[10px] text-muted-foreground">Absent</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-warning/20 bg-warning/5 p-2.5">
          <span className="text-lg font-bold text-warning">{stats.late}</span>
          <span className="text-[10px] text-muted-foreground">Late</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{currentStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
            <div className="text-[10px] text-muted-foreground">Current Streak</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{longestStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
            <div className="text-[10px] text-muted-foreground">Best Streak</div>
          </div>
        </div>
      </div>
    </>
  );
}
