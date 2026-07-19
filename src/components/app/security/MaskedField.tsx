import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaskedFieldProps {
  value: string;
  /** Number of visible trailing characters when masked. */
  visible?: number;
  onReveal?: () => void;
  className?: string;
  label?: string;
}

/** Mask sensitive values (Aadhaar, PAN, phone) with an optional reveal control. */
export function MaskedField({
  value,
  visible = 4,
  onReveal,
  className,
  label,
}: MaskedFieldProps) {
  const [shown, setShown] = useState(false);
  const masked = value.length <= visible ? value : "•".repeat(value.length - visible) + value.slice(-visible);

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-sm", className)}>
      <span aria-label={label}>{shown ? value : masked}</span>
      <button
        type="button"
        onClick={() => {
          setShown((s) => !s);
          if (!shown) onReveal?.();
        }}
        aria-label={shown ? `Hide ${label ?? "value"}` : `Reveal ${label ?? "value"}`}
        className="rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
