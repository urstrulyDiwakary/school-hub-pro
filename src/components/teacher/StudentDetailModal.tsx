import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AttendanceRecord } from "@/data/teacherData";
import StudentStatsCards from "./student-detail/StudentStatsCards";
import StudentCalendarHeatmap from "./student-detail/StudentCalendarHeatmap";
import StudentRemarksSection from "./student-detail/StudentRemarksSection";
import StudentExportActions from "./student-detail/StudentExportActions";
import { useStudentDetailData } from "./student-detail/useStudentDetailData";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  rollNo: string;
  filteredRecords: AttendanceRecord[];
}

export default function StudentDetailModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  rollNo,
  filteredRecords,
}: StudentDetailModalProps) {
  const { dailyStatus, months, stats, longestStreak, currentStreak, remarks } =
    useStudentDetailData(studentId, filteredRecords);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {rollNo}
            </span>
            <div className="flex-1">
              <div className="text-base font-semibold">{studentName}</div>
              <div className="text-xs font-normal text-muted-foreground">
                Roll No: {rollNo} • {stats.total} days tracked
              </div>
            </div>
            <StudentExportActions
              studentName={studentName}
              rollNo={rollNo}
              dailyStatus={dailyStatus}
              stats={stats}
              studentId={studentId}
            />
          </DialogTitle>
        </DialogHeader>

        <StudentStatsCards stats={stats} currentStreak={currentStreak} longestStreak={longestStreak} />
        <StudentCalendarHeatmap months={months} dailyStatus={dailyStatus} />
        <StudentRemarksSection studentId={studentId} />
      </DialogContent>
    </Dialog>
  );
}
