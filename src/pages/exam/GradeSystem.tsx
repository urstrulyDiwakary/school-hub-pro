import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GradeConfigurator } from "@/components/exam/GradeConfigurator";
import { gradeService } from "@/services/gradeService";
import { useExamStore } from "@/lib/exam/examStore";

export default function GradeSystem() {
  const gradeScale = useExamStore((s) => s.gradeScale);
  const [percentage, setPercentage] = useState(85);

  const band = gradeService.bandForPercentage(percentage, gradeScale);
  const pass = gradeService.isPass(percentage, gradeScale);

  return (
    <PortalPage title="Grade System" description="Configure grade rules, GPA and automatic grading">
      <GradeConfigurator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">GPA & Grade Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <Label className="text-xs">Enter percentage</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Grade" value={band.grade} />
            <Stat label="GPA" value={band.gpa.toFixed(1)} />
            <Stat label="Description" value={band.description} />
            <Stat label="Result" value={pass ? "Pass" : "Fail"} tone={pass ? "success" : "destructive"} />
          </div>
          <p className="text-xs text-muted-foreground">
            Active scale: <span className="font-medium text-foreground">{gradeScale.name}</span> ·
            Pass mark {gradeScale.passPercentage}%
          </p>
        </CardContent>
      </Card>
    </PortalPage>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {tone ? (
        <Badge variant="secondary" className={`mt-1 border-0 ${tone === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{value}</Badge>
      ) : (
        <p className="mt-1 text-lg font-bold">{value}</p>
      )}
    </div>
  );
}
