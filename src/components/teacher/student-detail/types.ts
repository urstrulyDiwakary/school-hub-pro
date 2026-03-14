import type { AttendanceStatus } from "@/data/teacherData";

export interface StudentRemark {
  id: string;
  text: string;
  date: string;
  tag: "general" | "concern" | "improvement" | "appreciation";
}

export const TAG_STYLES: Record<StudentRemark["tag"], string> = {
  general: "bg-muted text-muted-foreground",
  concern: "bg-destructive/10 text-destructive border-destructive/20",
  improvement: "bg-warning/10 text-warning border-warning/20",
  appreciation: "bg-success/10 text-success border-success/20",
};

export const TAG_LABELS: Record<StudentRemark["tag"], string> = {
  general: "General",
  concern: "Concern",
  improvement: "Improvement",
  appreciation: "Appreciation",
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getStatusBg = (status: AttendanceStatus | undefined) => {
  switch (status) {
    case "present": return "bg-success/20 border-success/30";
    case "absent": return "bg-destructive/20 border-destructive/30";
    case "late": return "bg-warning/20 border-warning/30";
    default: return "bg-muted/40 border-border/30";
  }
};
