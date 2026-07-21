// Campus + Academic Year switcher. Drop this anywhere in the shell.
// Switching triggers a state change that every service and hook already
// observes through PlatformContext — pages refresh automatically.

import { Building2, CalendarRange } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCampus, useAcademicYear, usePlatform } from "../context/PlatformContext";

export function TenantSwitcher() {
  const { campus, campuses, setCampus } = useCampus();
  const { academicYear, academicYears, setAcademicYear } = useAcademicYear();
  const { isFeatureEnabled } = usePlatform();
  const multi = isFeatureEnabled("multi_campus");

  return (
    <div className="flex items-center gap-2">
      {multi && campuses.length > 1 && (
        <Select value={campus?.id} onValueChange={setCampus}>
          <SelectTrigger className="h-8 w-[150px] gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5 opacity-70" />
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            {campuses.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={academicYear?.id} onValueChange={setAcademicYear}>
        <SelectTrigger className="h-8 w-[130px] gap-1.5 text-xs">
          <CalendarRange className="h-3.5 w-3.5 opacity-70" />
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((y) => (
            <SelectItem key={y.id} value={y.id} className="text-xs">
              AY {y.label}{y.status === "current" ? " · current" : y.status === "archived" ? " · archived" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
