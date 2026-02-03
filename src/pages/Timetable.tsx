import { useState } from "react";
import { Download, Printer, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [
  { time: "8:00 - 8:45", period: 1 },
  { time: "8:45 - 9:30", period: 2 },
  { time: "9:30 - 10:15", period: 3 },
  { time: "10:15 - 10:30", period: "Break", isBreak: true },
  { time: "10:30 - 11:15", period: 4 },
  { time: "11:15 - 12:00", period: 5 },
  { time: "12:00 - 12:45", period: 6 },
  { time: "12:45 - 1:30", period: "Lunch", isBreak: true },
  { time: "1:30 - 2:15", period: 7 },
  { time: "2:15 - 3:00", period: 8 },
];

const timetableData: Record<string, Record<number, { subject: string; teacher: string }>> = {
  Monday: {
    1: { subject: "Mathematics", teacher: "Mr. Sharma" },
    2: { subject: "English", teacher: "Mrs. Patel" },
    3: { subject: "Science", teacher: "Mr. Kumar" },
    4: { subject: "Hindi", teacher: "Mrs. Reddy" },
    5: { subject: "Social Studies", teacher: "Mr. Singh" },
    6: { subject: "Computer Science", teacher: "Mrs. Nair" },
    7: { subject: "Physical Education", teacher: "Mr. Gupta" },
    8: { subject: "Art", teacher: "Mrs. Iyer" },
  },
  Tuesday: {
    1: { subject: "Science", teacher: "Mr. Kumar" },
    2: { subject: "Mathematics", teacher: "Mr. Sharma" },
    3: { subject: "English", teacher: "Mrs. Patel" },
    4: { subject: "Computer Science", teacher: "Mrs. Nair" },
    5: { subject: "Hindi", teacher: "Mrs. Reddy" },
    6: { subject: "Social Studies", teacher: "Mr. Singh" },
    7: { subject: "Music", teacher: "Mr. Verma" },
    8: { subject: "Mathematics", teacher: "Mr. Sharma" },
  },
  Wednesday: {
    1: { subject: "English", teacher: "Mrs. Patel" },
    2: { subject: "Hindi", teacher: "Mrs. Reddy" },
    3: { subject: "Mathematics", teacher: "Mr. Sharma" },
    4: { subject: "Science", teacher: "Mr. Kumar" },
    5: { subject: "Physical Education", teacher: "Mr. Gupta" },
    6: { subject: "Social Studies", teacher: "Mr. Singh" },
    7: { subject: "Computer Science", teacher: "Mrs. Nair" },
    8: { subject: "Library", teacher: "Mrs. Das" },
  },
  Thursday: {
    1: { subject: "Hindi", teacher: "Mrs. Reddy" },
    2: { subject: "Science", teacher: "Mr. Kumar" },
    3: { subject: "Social Studies", teacher: "Mr. Singh" },
    4: { subject: "English", teacher: "Mrs. Patel" },
    5: { subject: "Mathematics", teacher: "Mr. Sharma" },
    6: { subject: "Art", teacher: "Mrs. Iyer" },
    7: { subject: "Science", teacher: "Mr. Kumar" },
    8: { subject: "Hindi", teacher: "Mrs. Reddy" },
  },
  Friday: {
    1: { subject: "Social Studies", teacher: "Mr. Singh" },
    2: { subject: "Computer Science", teacher: "Mrs. Nair" },
    3: { subject: "Hindi", teacher: "Mrs. Reddy" },
    4: { subject: "Mathematics", teacher: "Mr. Sharma" },
    5: { subject: "English", teacher: "Mrs. Patel" },
    6: { subject: "Science", teacher: "Mr. Kumar" },
    7: { subject: "Physical Education", teacher: "Mr. Gupta" },
    8: { subject: "Activity", teacher: "-" },
  },
  Saturday: {
    1: { subject: "Mathematics", teacher: "Mr. Sharma" },
    2: { subject: "Science", teacher: "Mr. Kumar" },
    3: { subject: "English", teacher: "Mrs. Patel" },
    4: { subject: "Revision", teacher: "-" },
    5: { subject: "Revision", teacher: "-" },
    6: { subject: "-", teacher: "-" },
    7: { subject: "-", teacher: "-" },
    8: { subject: "-", teacher: "-" },
  },
};

const subjectColors: Record<string, string> = {
  Mathematics: "bg-primary/10 text-primary border-primary/20",
  English: "bg-success/10 text-success border-success/20",
  Science: "bg-info/10 text-info border-info/20",
  Hindi: "bg-warning/10 text-warning border-warning/20",
  "Social Studies": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  "Computer Science": "bg-chart-6/10 text-chart-6 border-chart-6/20",
  "Physical Education": "bg-destructive/10 text-destructive border-destructive/20",
  Art: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Music: "bg-primary/10 text-primary border-primary/20",
  Library: "bg-muted text-muted-foreground border-muted",
  Activity: "bg-muted text-muted-foreground border-muted",
  Revision: "bg-muted text-muted-foreground border-muted",
};

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSection, setSelectedSection] = useState("A");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Timetable</h1>
          <p className="page-description">
            View and manage class timetables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Class:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Section:</span>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "E"].map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Week of Oct 28 - Nov 2, 2024</span>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card className="stat-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Class {selectedClass}-{selectedSection} Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 min-w-[100px] border-b bg-muted/50 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Time / Day
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="min-w-[140px] border-b p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, index) => (
                  <tr key={index} className={period.isBreak ? "bg-muted/30" : ""}>
                    <td className="sticky left-0 z-10 border-b bg-card p-3">
                      <div className="text-xs font-medium text-foreground">
                        {period.isBreak ? period.period : `Period ${period.period}`}
                      </div>
                      <div className="text-xs text-muted-foreground">{period.time}</div>
                    </td>
                    {days.map((day) => (
                      <td key={day} className="border-b p-2 text-center">
                        {period.isBreak ? (
                          <div className="flex items-center justify-center">
                            <span className="rounded-lg bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                              {period.period}
                            </span>
                          </div>
                        ) : (
                          (() => {
                            const data = timetableData[day]?.[period.period as number];
                            if (!data || data.subject === "-") {
                              return (
                                <div className="flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">-</span>
                                </div>
                              );
                            }
                            return (
                              <div
                                className={cn(
                                  "rounded-lg border p-2 transition-all hover:shadow-sm",
                                  subjectColors[data.subject] || "bg-muted text-muted-foreground"
                                )}
                              >
                                <p className="text-xs font-semibold">{data.subject}</p>
                                <p className="mt-0.5 text-[10px] opacity-80">{data.teacher}</p>
                              </div>
                            );
                          })()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="stat-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Subject Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(subjectColors)
              .filter(([subject]) => !["Library", "Activity", "Revision", "-"].includes(subject))
              .map(([subject, color]) => (
                <div
                  key={subject}
                  className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", color)}
                >
                  {subject}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
