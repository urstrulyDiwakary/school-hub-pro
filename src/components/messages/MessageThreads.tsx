import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Reply, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/types";
import { RECIPIENT_LABELS } from "@/services/schoolService";
import { useRealtimeInvalidate } from "@/hooks/useLiveSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface Thread {
  id: string; parent_id: string; parent_name: string; student_id: string | null;
  recipient: string; subject: string; status: string; updated_at: string;
  students?: { full_name: string; class_name: string; section: string } | null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function useThreads() {
  useRealtimeInvalidate(["message_threads", "thread_messages"], [["threads"]]);
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("message_threads")
        .select("*, students(full_name,class_name,section)").order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Thread[];
    },
  });
}

function ThreadMessages({ thread }: { thread: Thread }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const replyTo = (m: { sender_name: string; body: string }) => {
    const quote = m.body.length > 120 ? `${m.body.slice(0, 120)}…` : m.body;
    setReply(`> ${m.sender_name}: ${quote.replace(/\n/g, " ")}\n\n`);
    requestAnimationFrame(() => boxRef.current?.focus());
  };
  useRealtimeInvalidate(["thread_messages"], [["thread", thread.id]]);
  const q = useQuery({
    queryKey: ["thread", thread.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("thread_messages").select("*")
        .eq("thread_id", thread.id).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reply.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("thread_messages").insert({
      thread_id: thread.id, sender_id: user.id, sender_name: user.name,
      sender_role: ROLE_LABELS[user.role], body: reply.trim().slice(0, 2000),
    });
    setBusy(false);
    if (error) return toast({ title: "Could not send", description: error.message, variant: "destructive" });
    setReply("");
    qc.invalidateQueries({ queryKey: ["thread", thread.id] });
    qc.invalidateQueries({ queryKey: ["threads"] });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto">
        {q.data?.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={cn("max-w-[85%] rounded-lg border p-3", mine ? "ml-auto bg-primary/10" : "bg-muted/40")}>
              <p className="text-xs text-muted-foreground">{m.sender_name} · {m.sender_role} · {fmt(m.created_at)}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
              {!mine && (
                <Button type="button" variant="ghost" size="sm" className="mt-1 h-7 gap-1 px-2 text-xs"
                  aria-label={`Reply to ${m.sender_name}`} onClick={() => replyTo(m)}>
                  <Reply className="h-3.5 w-3.5" /> Reply
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="space-y-2">
        <Textarea ref={boxRef} aria-label="Reply" rows={3} maxLength={2000} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
        <Button type="submit" size="sm" className="gap-1" disabled={busy || !reply.trim()}>
          <Send className="h-4 w-4" /> Reply
        </Button>
      </form>
    </div>
  );
}

export function ThreadsPanel({ threads, emptyText, staffView }: { threads: Thread[]; emptyText: string; staffView?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = threads.find((t) => t.id === openId) ?? threads[0];

  if (!threads.length)
    return <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><MessageSquare className="h-4 w-4" /> {emptyText}</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="space-y-2">
        {threads.map((t) => (
          <button key={t.id} type="button" onClick={() => setOpenId(t.id)}
            className={cn("w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50", open?.id === t.id && "border-primary bg-primary/5")}>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{t.subject}</p>
              <Badge variant="secondary" className="shrink-0">{RECIPIENT_LABELS[t.recipient]}</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {staffView ? `${t.parent_name}${t.students ? ` · ${t.students.full_name} (${t.students.class_name}-${t.students.section})` : ""}` : `To ${RECIPIENT_LABELS[t.recipient]}`} · {fmt(t.updated_at)}
            </p>
          </button>
        ))}
      </div>
      {open && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{open.subject}</CardTitle></CardHeader>
          <CardContent><ThreadMessages key={open.id} thread={open} /></CardContent>
        </Card>
      )}
    </div>
  );
}
