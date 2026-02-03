import { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const studentsForAttendance = [
  { id: "1", name: "Arjun Sharma", rollNo: "01", status: "present" },
  { id: "2", name: "Priya Patel", rollNo: "02", status: "present" },
  { id: "3", name: "Rahul Kumar", rollNo: "03", status: "absent" },
  { id: "4", name: "Sneha Reddy", rollNo: "04", status: "present" },
  { id: "5", name: "Amit Singh", rollNo: "05", status: "present" },
  { id: "6", name: "Kavya Nair", rollNo: "06", status: "late" },
  { id: "7", name: "Rohan Gupta", rollNo: "07", status: "present" },
  { id: "8", name: "Ananya Verma", rollNo: "08", status: "present" },
  { id: "9", name: "Vikram Reddy", rollNo: "09", status: "absent" },
  { id: "10", name: "Meera Iyer", rollNo: "10", status: "present" },
  { id: "11", name: "Aditya Joshi", rollNo: "11", status: "present" },
  { id: "12", name: "Shreya Das", rollNo: "12", status: "present" },
];

type AttendanceStatus = "present" | "absent" | "late";

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    studentsForAttendance.reduce((acc, student) => {
      acc[student.id] = student.status as AttendanceStatus;
      return acc;
    }, {} as Record<string, AttendanceStatus>)
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Attendance</h1>
          <p className="page-description">
            Mark and manage daily student attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((presentCount / studentsForAttendance.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newAttendance: Record<string, AttendanceStatus> = {};
                  studentsForAttendance.forEach((s) => {
                    newAttendance[s.id] = "present";
                  });
                  setAttendance(newAttendance);
                }}
              >
                Mark All Present
              </Button>
              <Button size="sm">Save Attendance</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      <Card className="stat-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Class {selectedClass}-{selectedSection} Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {studentsForAttendance.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-all",
                  attendance[student.id] === "present" && "border-success/30 bg-success/5",
                  attendance[student.id] === "absent" && "border-destructive/30 bg-destructive/5",
                  attendance[student.id] === "late" && "border-warning/30 bg-warning/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        attendance[student.id] === "present" && "bg-success/20 text-success",
                        attendance[student.id] === "absent" && "bg-destructive/20 text-destructive",
                        attendance[student.id] === "late" && "bg-warning/20 text-warning"
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
