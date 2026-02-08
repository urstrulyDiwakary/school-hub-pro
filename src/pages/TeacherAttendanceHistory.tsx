import { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { assignedClasses, attendanceHistory } from "@/data/teacherData";
import type { AttendanceStatus } from "@/data/teacherData";
import StudentAttendanceSummary from "@/components/teacher/StudentAttendanceSummary";

export default function TeacherAttendanceHistory() {
  const [selectedClass, setSelectedClass] = useState("1");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(2026, 1, 1)
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const filteredRecords = useMemo(() => {
    return attendanceHistory.filter((record) => {
      if (record.classId !== selectedClass) return false;
      if (dateFrom && dateTo) {
        const recordDate = parseISO(record.date);
        return isWithinInterval(recordDate, { start: dateFrom, end: dateTo });
      }
      return true;
    });
  }, [selectedClass, dateFrom, dateTo]);

  const summary = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalRecords = 0;

    filteredRecords.forEach((record) => {
      record.records.forEach((r) => {
        totalRecords++;
        if (r.status === "present") totalPresent++;
        if (r.status === "absent") totalAbsent++;
        if (r.status === "late") totalLate++;
      });
    });

    return { totalPresent, totalAbsent, totalLate, totalRecords };
  }, [filteredRecords]);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return (
          <span className="badge-active gap-1">
            <CheckCircle2 className="h-3 w-3" /> Present
          </span>
        );
      case "absent":
        return (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive gap-1">
            <XCircle className="h-3 w-3" /> Absent
          </span>
        );
      case "late":
        return (
          <span className="badge-pending gap-1">
            <Clock className="h-3 w-3" /> Late
          </span>
        );
      default:
        return <span className="badge-inactive">—</span>;
    }
  };

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.warning("No records to export");
      return;
    }

    const headers = ["Date", "Class", "Roll No", "Student Name", "Status"];
    const rows = filteredRecords.flatMap((record) =>
      record.records.map((r) => [
        record.date,
        record.className,
        r.rollNo,
        r.studentName,
        r.status,
      ])
    );

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_history_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Attendance history exported successfully");
  };

  const selectedClassInfo = assignedClasses.find((c) => c.id === selectedClass);
  const attendanceRate =
    summary.totalRecords > 0
      ? Math.round((summary.totalPresent / summary.totalRecords) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Attendance History</h1>
          <p className="page-description">
            View past attendance records with date range filtering
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportToCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredRecords.length}
                </p>
                <p className="text-sm text-muted-foreground">Days Recorded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {attendanceRate}%
                </p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {summary.totalAbsent}
                </p>
                <p className="text-sm text-muted-foreground">Total Absences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {summary.totalLate}
                </p>
                <p className="text-sm text-muted-foreground">Total Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {assignedClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[160px] justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[160px] justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Student-wise Summary */}
      <StudentAttendanceSummary filteredRecords={filteredRecords} />

      {/* Records */}
      {filteredRecords.length === 0 ? (
        <Card className="stat-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-foreground">No records found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust your date range or class filter
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredRecords.map((record) => (
          <Card key={`${record.date}-${record.classId}`} className="stat-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {format(parseISO(record.date), "EEEE, MMMM dd, yyyy")}
                </CardTitle>
                <Badge variant="secondary">{record.className}</Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="text-success">
                  ✓ {record.records.filter((r) => r.status === "present").length} Present
                </span>
                <span className="text-destructive">
                  ✗ {record.records.filter((r) => r.status === "absent").length} Absent
                </span>
                <span className="text-warning">
                  ◷ {record.records.filter((r) => r.status === "late").length} Late
                </span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {record.records.map((r) => (
                    <tr key={r.studentId}>
                      <td className="font-medium">{r.rollNo}</td>
                      <td>{r.studentName}</td>
                      <td>{getStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
