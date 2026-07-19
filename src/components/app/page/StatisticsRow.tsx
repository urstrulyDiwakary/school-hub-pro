import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatisticsRowProps {
  children: ReactNode;
  className?: string;
  /** Number of columns at xl breakpoint (default: auto). */
  columns?: 2 | 3 | 4 | 5 | 6;
}

const colMap: Record<number, string> = {
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

export function StatisticsRow({ children, className, columns = 4 }: StatisticsRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3 sm:gap-4",
        colMap[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
