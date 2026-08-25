import { AlertTriangle, CalendarDays, FileText, GraduationCap, PartyPopper } from "lucide-react";
import type { AnnouncementCategory } from "@/lib/announcementStore";

export const categoryMeta: Record<
  AnnouncementCategory,
  { icon: React.ComponentType<{ className?: string }>; chip: string; dot: string }
> = {
  holiday: { icon: PartyPopper, chip: "bg-success/10 text-success", dot: "bg-success" },
  alert: { icon: AlertTriangle, chip: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  event: { icon: CalendarDays, chip: "bg-info/10 text-info", dot: "bg-info" },
  notice: { icon: FileText, chip: "bg-primary/10 text-primary", dot: "bg-primary" },
  exam: { icon: GraduationCap, chip: "bg-warning/10 text-warning", dot: "bg-warning" },
};

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
