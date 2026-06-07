import { useState } from "react";
import { Plus } from "lucide-react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExamTable } from "@/components/exam/ExamTable";
import { useToast } from "@/hooks/use-toast";
import { examService } from "@/services/examService";
import { classList, examTypes, subjectList, type ExamType } from "@/data/exam/exams";

export default function ExamConfiguration() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ExamType>("Unit Test");
  const [year, setYear] = useState("2025-26");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(33);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = () => {
    if (!name || !startDate || !endDate || classes.length === 0 || subjects.length === 0) {
      toast({ title: "Missing fields", description: "Fill all required fields and pick classes & subjects.", variant: "destructive" });
      return;
    }
    toast({ title: "Exam created", description: `${name} (${type}) configured for ${classes.length} class(es).` });
    setOpen(false);
  };

  return (
    <PortalPage
      title="Exam Configuration"
      description="Set up examinations, classes, subjects and marking schemes"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="h-4 w-4" /> New Exam</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Exam Setup</DialogTitle>
              <DialogDescription>Define the exam, schedule and applicable classes & subjects.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Exam Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="e.g. Annual Examination" />
                </div>
                <div>
                  <Label className="text-xs">Exam Type *</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ExamType)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {examTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Academic Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Max Marks</Label>
                    <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Passing Marks</Label>
                    <Input type="number" value={passingMarks} onChange={(e) => setPassingMarks(Number(e.target.value))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">End Date *</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Classes *</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {classList.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={classes.includes(c)} onCheckedChange={() => toggle(classes, setClasses, c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Subjects *</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {subjectList.map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={subjects.includes(s)} onCheckedChange={() => toggle(subjects, setSubjects, s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Create Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <ExamTable exams={examService.getAll()} />
    </PortalPage>
  );
}
