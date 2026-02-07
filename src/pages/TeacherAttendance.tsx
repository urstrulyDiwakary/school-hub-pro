import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Users, Save } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { classStudents, assignedClasses } from "@/data/teacherData";
import type { AttendanceStatus } from "@/data/teacherData";
import { notifyAbsentStudent, dispatchPendingNotifications } from "@/utils/notificationService";

export default function TeacherAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("1");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    classStudents.reduce((acc, student) => {
      acc[student.id] = "unmarked";
      return acc;
    }, {} as Record<string, AttendanceStatus>)
  );

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const toggleAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => { newAttendance[s.id] = "present"; });
    setAttendance(newAttendance);
    toast.success("All students marked present");
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => { newAttendance[s.id] = "absent"; });
    setAttendance(newAttendance);
    toast.success("All students marked absent");
  };

  const resetAttendance = () => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => { newAttendance[s.id] = "unmarked"; });
    setAttendance(newAttendance);
    toast.info("Attendance reset");
  };

  const saveAttendance = () => {
    const unmarkedCount = Object.values(attendance).filter((s) => s === "unmarked").length;
    if (unmarkedCount > 0) {
      toast.warning(`${unmarkedCount} student(s) still unmarked`);
      return;
    }

    // Queue absence notifications for parents
    const selectedClassInfo = assignedClasses.find((c) => c.id === selectedClass);
    const className = selectedClassInfo?.name || "Unknown Class";
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    classStudents.forEach((student) => {
      if (attendance[student.id] === "absent") {
        notifyAbsentStudent({
          studentId: student.id,
          studentName: student.name,
          className,
          date: dateStr,
        });
      }
    });

    const notificationCount = dispatchPendingNotifications();
    
    if (notificationCount > 0) {
      toast.success(
        `Attendance saved. ${notificationCount} absence alert(s) queued for parents.`
      );
    } else {
      toast.success("Attendance saved successfully");
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;
  const unmarkedCount = Object.values(attendance).filter((s) => s === "unmarked").length;

  const selectedClassInfo = assignedClasses.find((c) => c.id === selectedClass);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Mark Attendance</h1>
          <p className="page-description">Record daily attendance for your classes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{presentCount}</p>
                <p className="text-sm text-muted-foreground">Present</p>
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
                <p className="text-2xl font-bold text-foreground">{absentCount}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
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
                <p className="text-2xl font-bold text-foreground">{lateCount}</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unmarkedCount}</p>
                <p className="text-sm text-muted-foreground">Unmarked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-44">
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
                      "w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                All Present
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAbsent}>
                <XCircle className="h-4 w-4 mr-1" />
                All Absent
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAttendance}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      <Card className="stat-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedClassInfo?.name} - {selectedClassInfo?.subject}
            </CardTitle>
            <Button onClick={saveAttendance} disabled={unmarkedCount > 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classStudents.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 rounded-xl border p-3 sm:p-4 transition-all",
                  attendance[student.id] === "present" && "border-success/30 bg-success/5",
                  attendance[student.id] === "absent" && "border-destructive/30 bg-destructive/5",
                  attendance[student.id] === "late" && "border-warning/30 bg-warning/5",
                  attendance[student.id] === "unmarked" && "border-border bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        attendance[student.id] === "present" && "bg-success/20 text-success",
                        attendance[student.id] === "absent" && "bg-destructive/20 text-destructive",
                        attendance[student.id] === "late" && "bg-warning/20 text-warning",
                        attendance[student.id] === "unmarked" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">Roll No: {student.rollNo}</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => toggleAttendance(student.id, "present")}
                    className={cn(
                      "rounded-lg p-2 transition-all",
                      attendance[student.id] === "present"
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground hover:bg-success/20 hover:text-success"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleAttendance(student.id, "absent")}
                    className={cn(
                      "rounded-lg p-2 transition-all",
                      attendance[student.id] === "absent"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    )}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleAttendance(student.id, "late")}
                    className={cn(
                      "rounded-lg p-2 transition-all",
                      attendance[student.id] === "late"
                        ? "bg-warning text-warning-foreground"
                        : "bg-muted text-muted-foreground hover:bg-warning/20 hover:text-warning"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
