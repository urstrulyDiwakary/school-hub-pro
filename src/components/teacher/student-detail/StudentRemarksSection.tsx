import { useMemo, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { MessageSquarePlus, Send, Trash2, Pencil, Check, X, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TAG_STYLES, TAG_LABELS, type StudentRemark } from "./types";

interface StudentRemarksSectionProps {
  studentId: string;
}

export default function StudentRemarksSection({ studentId }: StudentRemarksSectionProps) {
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

  const updateRemarks = useCallback((updater: (prev: StudentRemark[]) => StudentRemark[]) => {
    setRemarks((prev) => {
      const next = updater(prev);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  return (
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

      {/* Search & filter */}
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

      {/* Add remark input */}
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
  );
}
