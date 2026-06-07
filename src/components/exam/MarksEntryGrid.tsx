import { useEffect, useMemo, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExamStore } from "@/lib/exam/examStore";

export interface MarksRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  theory: number;
  practical: number;
  internal: number;
  viva: number;
}

type Component = "theory" | "practical" | "internal" | "viva";
const components: Component[] = ["theory", "practical", "internal", "viva"];

interface MarksEntryGridProps {
  draftKey: string;
  rows: MarksRow[];
  maxMarks: number;
  passingMarks: number;
}

/** Editable marks grid with validation + debounced auto-save to the exam store. */
export function MarksEntryGrid({ draftKey, rows: initialRows, maxMarks, passingMarks }: MarksEntryGridProps) {
  const saveDraft = useExamStore((s) => s.saveDraft);
  const [rows, setRows] = useState<MarksRow[]>(initialRows);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => setRows(initialRows), [draftKey]); // reset when subject/class changes

  // Debounced auto-save of computed totals.
  useEffect(() => {
    if (saveState === "idle") return;
    const totals = Object.fromEntries(
      rows.map((r) => [r.studentId, r.theory + r.practical + r.internal + r.viva]),
    );
    const t = setTimeout(() => {
      saveDraft(draftKey, totals);
      setSaveState("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [rows, draftKey, saveDraft, saveState]);

  const update = (studentId: string, comp: Component, raw: string) => {
    const value = Math.max(0, Number(raw) || 0);
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, [comp]: value } : r)));
    setSaveState("saving");
  };

  const invalidCount = useMemo(
    () => rows.filter((r) => r.theory + r.practical + r.internal + r.viva > maxMarks).length,
    [rows, maxMarks],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Max marks: <span className="font-medium text-foreground">{maxMarks}</span> · Passing:{" "}
          <span className="font-medium text-foreground">{passingMarks}</span>
        </p>
        <div className="flex items-center gap-2 text-xs">
          {invalidCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {invalidCount} over limit
            </span>
          )}
          {saveState === "saving" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving draft…
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3.5 w-3.5" /> Draft saved
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Theory</TableHead>
              <TableHead className="text-center">Practical</TableHead>
              <TableHead className="text-center">Internal</TableHead>
              <TableHead className="text-center">Viva</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const total = r.theory + r.practical + r.internal + r.viva;
              const over = total > maxMarks;
              const passed = total >= passingMarks && !over;
              return (
                <TableRow key={r.studentId}>
                  <TableCell className="text-muted-foreground">{r.rollNo}</TableCell>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  {components.map((comp) => (
                    <TableCell key={comp} className="text-center">
                      <Input
                        type="number"
                        min={0}
                        value={r[comp]}
                        onChange={(e) => update(r.studentId, comp, e.target.value)}
                        aria-label={`${comp} marks for ${r.studentName}`}
                        className="h-9 w-16 mx-auto text-center"
                      />
                    </TableCell>
                  ))}
                  <TableCell className={cn("text-center font-semibold", over && "text-destructive")}>
                    {total}
                  </TableCell>
                  <TableCell className="text-center">
                    {over ? (
                      <Badge variant="secondary" className="border-0 bg-destructive/10 text-destructive">
                        Invalid
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border-0",
                          passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {passed ? "Pass" : "Fail"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
