import { useState } from "react";
import { Printer, CalendarDays } from "lucide-react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { examService } from "@/services/examService";

export default function ExamTimetable() {
  const exams = examService.getAll();
  const [examId, setExamId] = useState("EXM005");
  const exam = examService.getById(examId);
  const slots = examService.getTimetable(examId);

  return (
    <PortalPage
      title="Exam Timetable"
      description="Subject-wise schedule, hall allocation and invigilator assignment"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {exam?.name ?? "Timetable"}
          </CardTitle>
          {exam && (
            <p className="text-sm text-muted-foreground">
              {exam.startDate} – {exam.endDate} · {exam.academicYear}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No timetable published for this exam yet.</p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead>Invigilator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">{s.date}</TableCell>
                      <TableCell className="whitespace-nowrap">{s.startTime} – {s.endTime}</TableCell>
                      <TableCell>{s.className}</TableCell>
                      <TableCell className="font-medium">{s.subject}</TableCell>
                      <TableCell><Badge variant="outline">{s.hall}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{s.invigilator}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
