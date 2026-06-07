import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gradeService } from "@/services/gradeService";
import { gradeScalePresets, type BoardType, type GradeScale } from "@/data/exam/grades";
import { useExamStore } from "@/lib/exam/examStore";

/** Configure the active grade scale: choose a board preset or edit bands. */
export function GradeConfigurator() {
  const { toast } = useToast();
  const gradeScale = useExamStore((s) => s.gradeScale);
  const setGradeScale = useExamStore((s) => s.setGradeScale);
  const resetGradeScale = useExamStore((s) => s.resetGradeScale);
  const [draft, setDraft] = useState<GradeScale>(gradeScale);

  const validation = gradeService.validateScale(draft);

  const applyPreset = (board: BoardType) => setDraft(gradeScalePresets[board]);

  const updateBand = (index: number, field: "min" | "max" | "gpa", value: string) => {
    const num = Number(value) || 0;
    setDraft((prev) => ({
      ...prev,
      board: "CUSTOM",
      name: prev.board === "CUSTOM" ? prev.name : "Custom Scale",
      bands: prev.bands.map((b, i) => (i === index ? { ...b, [field]: num } : b)),
    }));
  };

  const save = () => {
    if (!validation.valid) {
      toast({ title: "Invalid grade scale", description: validation.errors[0], variant: "destructive" });
      return;
    }
    setGradeScale(draft);
    toast({ title: "Grade scale saved", description: `${draft.name} is now active.` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Grade Configuration</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={draft.board} onValueChange={(v) => applyPreset(v as BoardType)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Preset" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="STATE">State Board</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { resetGradeScale(); setDraft(gradeScalePresets.CBSE); }}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Scale name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, board: "CUSTOM" })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Pass percentage</Label>
            <Input
              type="number"
              value={draft.passPercentage}
              onChange={(e) => setDraft({ ...draft, passPercentage: Number(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Min %</TableHead>
                <TableHead>Max %</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.bands.map((band, i) => (
                <TableRow key={band.grade}>
                  <TableCell><Badge variant="secondary" className="border-0">{band.grade}</Badge></TableCell>
                  <TableCell><Input type="number" value={band.min} onChange={(e) => updateBand(i, "min", e.target.value)} className="h-9 w-20" aria-label={`${band.grade} min`} /></TableCell>
                  <TableCell><Input type="number" value={band.max} onChange={(e) => updateBand(i, "max", e.target.value)} className="h-9 w-20" aria-label={`${band.grade} max`} /></TableCell>
                  <TableCell><Input type="number" value={band.gpa} onChange={(e) => updateBand(i, "gpa", e.target.value)} className="h-9 w-20" aria-label={`${band.grade} gpa`} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{band.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!validation.valid && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <ul className="space-y-0.5">
              {validation.errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={save} className="gap-1" disabled={!validation.valid}>
            <Check className="h-4 w-4" /> Save Grade Scale
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
