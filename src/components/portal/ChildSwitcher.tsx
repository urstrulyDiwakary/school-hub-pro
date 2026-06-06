import { useActiveStudent } from "@/hooks/useActiveStudent";
import { usePortalStore } from "@/lib/portalStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Lets a parent switch between their children. Hidden for single-child accounts. */
export function ChildSwitcher() {
  const { student, children, isParent } = useActiveStudent();
  const setSelectedStudent = usePortalStore((s) => s.setSelectedStudent);

  if (!isParent || children.length < 2) return null;

  return (
    <Select value={student?.id} onValueChange={setSelectedStudent}>
      <SelectTrigger className="w-[180px]" aria-label="Select child">
        <SelectValue placeholder="Select child" />
      </SelectTrigger>
      <SelectContent>
        {children.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name} · {c.academic.className}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
