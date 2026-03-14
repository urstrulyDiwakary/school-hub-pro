import { useMemo, useState, useCallback } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { CheckCircle2, XCircle, Clock, CalendarDays, Flame, Trophy, MessageSquarePlus, Send, Trash2, Pencil, Check, X, ArrowUpDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AttendanceRecord, AttendanceStatus } from "@/data/teacherData";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  rollNo: string;
  filteredRecords: AttendanceRecord[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface StudentRemark {
  id: string;
  text: string;
  date: string;
  tag: "general" | "concern" | "improvement" | "appreciation";
}

const TAG_STYLES: Record<StudentRemark["tag"], string> = {
  general: "bg-muted text-muted-foreground",
  concern: "bg-destructive/10 text-destructive border-destructive/20",
  improvement: "bg-warning/10 text-warning border-warning/20",
  appreciation: "bg-success/10 text-success border-success/20",
};

const TAG_LABELS: Record<StudentRemark["tag"], string> = {
  general: "General",
  concern: "Concern",
  improvement: "Improvement",
  appreciation: "Appreciation",
};

export default function StudentDetailModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  rollNo,
  filteredRecords,
}: StudentDetailModalProps) {
  const storageKey = `teacher-remarks-${studentId}`;
  const [remarks, setRemarks] = useState<StudentRemark[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [newRemark, setNewRemark] = useState("");
  const [selectedTag, setSelectedTag] = useState<StudentRemark["tag"]>("general");
  const [showRemarkInput, setShowRemarkInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTag, setEditTag] = useState<StudentRemark["tag"]>("general");
  const [filterTag, setFilterTag] = useState<StudentRemark["tag"] | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRemarks = useMemo(() => {
    let result = filterTag === "all" ? remarks : remarks.filter((r) => r.tag === filterTag);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((r) => r.text.toLowerCase().includes(q));
    }
    return result.slice().sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [remarks, filterTag, sortOrder, searchQuery]);

  // Sync remarks to localStorage whenever they change
  const updateRemarks = useCallback((updater: (prev: StudentRemark[]) => StudentRemark[]) => {
    setRemarks((prev) => {
      const next = updater(prev);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);
  // Build a map of date -> status for this student
  const dailyStatus = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    filteredRecords.forEach((record) => {
      const studentRecord = record.records.find((r) => r.studentId === studentId);
      if (studentRecord) {
        map.set(record.date, studentRecord.status);
      }
    });
    return map;
  }, [filteredRecords, studentId]);

  // Get unique months from the filtered records
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    filteredRecords.forEach((r) => {
      const d = parseISO(r.date);
      monthSet.add(format(d, "yyyy-MM"));
    });
    return Array.from(monthSet).sort();
  }, [filteredRecords]);

  // Stats & streaks
  const { stats, longestStreak, currentStreak } = useMemo(() => {
    let present = 0, absent = 0, late = 0, total = 0;
    dailyStatus.forEach((status) => {
      total++;
      if (status === "present") present++;
      if (status === "absent") absent++;
      if (status === "late") late++;
    });
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Compute streaks from sorted dates
    const sortedDates = Array.from(dailyStatus.keys()).sort();
    let longest = 0, current = 0, streak = 0;
    for (const dateKey of sortedDates) {
      if (dailyStatus.get(dateKey) === "present") {
        streak++;
        if (streak > longest) longest = streak;
      } else {
        streak = 0;
      }
    }
    // Current streak = streak at the end of sorted dates
    current = streak;

    return {
      stats: { present, absent, late, total, rate },
      longestStreak: longest,
      currentStreak: current,
    };
  }, [dailyStatus]);

  const getStatusColor = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case "present": return "bg-success text-success-foreground";
      case "absent": return "bg-destructive text-destructive-foreground";
      case "late": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBg = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case "present": return "bg-success/20 border-success/30";
      case "absent": return "bg-destructive/20 border-destructive/30";
      case "late": return "bg-warning/20 border-warning/30";
      default: return "bg-muted/40 border-border/30";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {rollNo}
            </span>
            <div>
              <div className="text-base font-semibold">{studentName}</div>
              <div className="text-xs font-normal text-muted-foreground">
                Roll No: {rollNo} • {stats.total} days tracked
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="flex flex-col items-center rounded-lg border border-border/50 p-2.5">
            <span className="text-lg font-bold text-foreground">{stats.rate}%</span>
            <span className="text-[10px] text-muted-foreground">Rate</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-success/20 bg-success/5 p-2.5">
            <span className="text-lg font-bold text-success">{stats.present}</span>
            <span className="text-[10px] text-muted-foreground">Present</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
            <span className="text-lg font-bold text-destructive">{stats.absent}</span>
            <span className="text-[10px] text-muted-foreground">Absent</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-warning/20 bg-warning/5 p-2.5">
            <span className="text-lg font-bold text-warning">{stats.late}</span>
            <span className="text-[10px] text-muted-foreground">Late</span>
          </div>
        </div>

        {/* Streak Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{currentStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
              <div className="text-[10px] text-muted-foreground">Current Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{longestStreak} <span className="text-xs font-normal text-muted-foreground">days</span></div>
              <div className="text-[10px] text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Calendar Heatmap per month */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Daily Attendance Heatmap
          </div>

          {months.map((monthStr) => {
            const monthDate = parseISO(`${monthStr}-01`);
            const days = eachDayOfInterval({
              start: startOfMonth(monthDate),
              end: endOfMonth(monthDate),
            });
            const firstDayOffset = getDay(days[0]);

            return (
              <div key={monthStr} className="rounded-lg border border-border/50 p-3">
                <div className="text-xs font-semibold text-foreground mb-2">
                  {format(monthDate, "MMMM yyyy")}
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}
                  {days.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const status = dailyStatus.get(dateKey);
                    const hasRecord = status !== undefined;
                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "h-8 rounded-md flex items-center justify-center text-[11px] font-medium border transition-colors",
                          hasRecord ? getStatusBg(status) : "bg-background border-transparent"
                        )}
                        title={hasRecord ? `${format(day, "MMM dd")} — ${status}` : format(day, "MMM dd")}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-2 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-success/20 border border-success/30" />
            Present
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-destructive/20 border border-destructive/30" />
            Absent
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-warning/20 border border-warning/30" />
            Late
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-muted/40 border border-border/30" />
            No record
          </div>
        </div>

        {/* Teacher Remarks Section */}
        <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Teacher Remarks
            </div>
            {!showRemarkInput && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => setShowRemarkInput(true)}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Add Note
              </Button>
             )}
           </div>

           {/* Tag filter */}
           {remarks.length > 0 && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search remarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-border/50 bg-background pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
               <div className="flex items-center justify-between gap-2 flex-wrap">
                 <div className="flex items-center gap-1.5 flex-wrap">
                 <span className="text-[10px] text-muted-foreground mr-1">Filter:</span>
               <button
                 onClick={() => setFilterTag("all")}
                 className={cn(
                   "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all",
                   filterTag === "all"
                     ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-offset-1 ring-primary/30"
                     : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                 )}
               >
                 All ({remarks.length})
               </button>
               {(Object.keys(TAG_LABELS) as StudentRemark["tag"][]).map((tag) => {
                 const count = remarks.filter((r) => r.tag === tag).length;
                 if (count === 0) return null;
                 return (
                   <button
                     key={tag}
                     onClick={() => setFilterTag(tag)}
                     className={cn(
                       "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all",
                       filterTag === tag
                         ? cn(TAG_STYLES[tag], "ring-1 ring-offset-1 ring-primary/30")
                         : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                     )}
                   >
                     {TAG_LABELS[tag]} ({count})
                   </button>
                 );
                })}
                </div>
                <button
                  onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border border-border/50 bg-muted/50 text-muted-foreground hover:bg-muted transition-all"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </button>
              </div>
              </div>
            )}
          {showRemarkInput && (
            <div className="rounded-lg border border-border/50 p-3 space-y-2.5 bg-muted/10">
              <Textarea
                placeholder="Write a remark about this student's attendance, behavior, or performance..."
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(TAG_LABELS) as StudentRemark["tag"][]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all",
                      selectedTag === tag
                        ? cn(TAG_STYLES[tag], "ring-1 ring-offset-1 ring-primary/30")
                        : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                    )}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => { setShowRemarkInput(false); setNewRemark(""); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs h-7"
                  disabled={!newRemark.trim()}
                  onClick={() => {
                    const remark: StudentRemark = {
                      id: crypto.randomUUID(),
                      text: newRemark.trim(),
                      date: new Date().toISOString(),
                      tag: selectedTag,
                    };
                    updateRemarks((prev) => [remark, ...prev]);
                    setNewRemark("");
                    setSelectedTag("general");
                    setShowRemarkInput(false);
                    toast.success("Remark added");
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Existing remarks */}
          {remarks.length === 0 && !showRemarkInput ? (
            <p className="text-xs text-muted-foreground italic">No remarks yet. Click "Add Note" to add one.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredRemarks.map((remark) => {
                const isEditing = editingId === remark.id;
                return (
                <div
                  key={remark.id}
                  className="rounded-lg border border-border/50 p-2.5 group hover:bg-muted/20 transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="text-sm resize-none"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(Object.keys(TAG_LABELS) as StudentRemark["tag"][]).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setEditTag(tag)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all",
                              editTag === tag
                                ? cn(TAG_STYLES[tag], "ring-1 ring-offset-1 ring-primary/30")
                                : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                            )}
                          >
                            {TAG_LABELS[tag]}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs h-7 gap-1"
                          disabled={!editText.trim()}
                          onClick={() => {
                            updateRemarks((prev) =>
                              prev.map((r) =>
                                r.id === remark.id
                                  ? { ...r, text: editText.trim(), tag: editTag }
                                  : r
                              )
                            );
                            setEditingId(null);
                            toast.success("Remark updated");
                          }}
                        >
                          <Check className="h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", TAG_STYLES[remark.tag])}>
                          {TAG_LABELS[remark.tag]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(parseISO(remark.date), "MMM dd, hh:mm a")}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{remark.text}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(remark.id);
                          setEditText(remark.text);
                          setEditTag(remark.tag);
                        }}
                        className="text-muted-foreground hover:text-primary p-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          updateRemarks((prev) => prev.filter((r) => r.id !== remark.id));
                          toast.success("Remark deleted");
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
