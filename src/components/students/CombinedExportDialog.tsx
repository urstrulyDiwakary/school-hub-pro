import { useState } from "react";
import { format, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportCombinedPdf, type CombinedStudentInput } from "@/lib/combinedExport";
import { resolveEffectivePermissions } from "@/lib/userRole";

interface CombinedExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: CombinedStudentInput[];
}

export default function CombinedExportDialog({ open, onOpenChange, students }: CombinedExportDialogProps) {
  const today = new Date();
  const [fromDate, setFromDate] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(today, "yyyy-MM-dd"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perms = resolveEffectivePermissions();
  const canExport = perms.pdf && perms.effectiveRole === "admin";

  const handleExport = async () => {
    setError(null);
    if (students.length === 0) {
      setError("Select at least one student to export.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Pick both a from and to date.");
      return;
    }
    if (fromDate > toDate) {
      setError("'From' date must be on or before 'To' date.");
      return;
    }
    if (!canExport) {
      setError("You do not have permission to generate combined PDF reports.");
      return;
    }

    setBusy(true);
    try {
      const result = exportCombinedPdf({ students, fromDate, toDate }, "admin");
      toast.success(`Combined PDF downloaded — ${result.studentCount} students, ${result.pages} pages`);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate combined report";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Combined Attendance Report
          </DialogTitle>
          <DialogDescription>
            Generate a single PDF covering {students.length} selected student
            {students.length === 1 ? "" : "s"} for the chosen date range. Each
            student gets their own page with a summary and daily breakdown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!canExport && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">Admin only</AlertTitle>
              <AlertDescription className="text-xs">
                Combined exports are restricted to admin users.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="combined-from" className="text-xs">From date</Label>
              <Input
                id="combined-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="combined-to" className="text-xs">To date</Label>
              <Input
                id="combined-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            <p className="font-medium">Selected students ({students.length})</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-2 text-muted-foreground">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{s.name}</span>
                  <span className="font-mono">{s.admissionNo}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={busy || !canExport}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {busy ? "Generating…" : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
