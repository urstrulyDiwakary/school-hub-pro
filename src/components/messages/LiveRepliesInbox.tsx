// Parent inbox: real replies from school staff to this parent's messages,
// newest first, with read tracking kept on this device.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { useRealtimeInvalidate } from "@/hooks/useLiveSchool";
import { useThreads } from "@/components/messages/MessageThreads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const readKey = (userId: string) => `edutrack-parent-inbox-read-${userId}`;

export function getLastReadAt(userId: string): number {
  const v = localStorage.getItem(readKey(userId));
  const n = v ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function markAllRepliesRead(userId: string) {
  localStorage.setItem(readKey(userId), String(Date.now()));
}

interface ReplyRow {
  id: string;
  thread_id: string;
  sender_name: string;
  body: string;
  created_at: string;
  message_threads: { subject: string } | null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** Staff replies across all of this parent's conversations. */
export function LiveRepliesInbox({ onOpenMessages }: { onOpenMessages?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const threads = useThreads();
  const ids = (threads.data ?? []).map((t) => t.id);

  useRealtimeInvalidate(["thread_messages", "message_threads"], [["parent-inbox"]]);

  const q = useQuery({
    queryKey: ["parent-inbox", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async (): Promise<ReplyRow[]> => {
      const { data, error } = await supabase
        .from("thread_messages")
        .select("id, thread_id, sender_name, body, created_at, message_threads(subject)")
        .in("thread_id", ids)
        .neq("sender_role", "Parent")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as ReplyRow[];
    },
  });

  const readAt = user ? getLastReadAt(user.id) : Number.MAX_SAFE_INTEGER;
  const replies = q.data ?? [];
  const unread = replies.filter((r) => new Date(r.created_at).getTime() > readAt);

  if (!user) return null;

  if (replies.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <MessageSquare className="h-8 w-8" />
          <p className="text-sm">No replies yet. When the school replies to your message, it appears here.</p>
        </CardContent>
      </Card>
    );

  const markAll = () => {
    markAllRepliesRead(user.id);
    qc.invalidateQueries({ queryKey: ["parent-inbox"] });
  };

  return (
    <div className="space-y-3">
      {unread.length > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={markAll}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read ({unread.length})
          </Button>
        </div>
      )}
      {replies.map((r) => {
        const isNew = new Date(r.created_at).getTime() > readAt;
        return (
          <Card key={r.id} className={cn(isNew && "border-primary/30")}>
            <CardContent className="flex gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Reply from {r.sender_name}</p>
                  {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="New" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">Re: {r.message_threads?.subject ?? "Your message"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-foreground/90">{r.body}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{fmt(r.created_at)}</p>
                  {onOpenMessages && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onOpenMessages}>
                      Open conversation
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
