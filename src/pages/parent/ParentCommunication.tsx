import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { NotificationsView } from "@/components/portal/features/NotificationsView";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { ThreadsPanel, useThreads } from "@/components/messages/MessageThreads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveStudent } from "@/hooks/useActiveStudent";
import { useParentMessages } from "@/lib/parentMessageStore";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { RECIPIENT_LABELS } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

const RECIPIENTS = ["class_teacher", "principal", "accounts", "transport"] as const;

export default function ParentCommunication() {
  const user = useAuthStore((s) => s.user);
  const isLive = !!user?.live;
  const { student } = useActiveStudent();
  const demo = useParentMessages();
  const threads = useThreads();
  const qc = useQueryClient();
  const [to, setTo] = useState<string>("class_teacher");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const label = (r: string) =>
    r === "class_teacher" && student ? `Class Teacher (${student.academic.classTeacher})` : RECIPIENT_LABELS[r];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !user || !subject.trim() || !body.trim()) return;
    if (!isLive) {
      demo.send({ studentId: student.id, to: label(to), subject: subject.trim().slice(0, 120), body: body.trim().slice(0, 2000) });
    } else {
      setBusy(true);
      const { data: t, error } = await supabase.from("message_threads").insert({
        parent_id: user.id, parent_name: user.name, student_id: student.id, recipient: to,
        subject: subject.trim().slice(0, 120),
      }).select("id").single();
      if (!error && t) {
        await supabase.from("thread_messages").insert({
          thread_id: t.id, sender_id: user.id, sender_name: user.name, sender_role: "Parent", body: body.trim().slice(0, 2000),
        });
      }
      setBusy(false);
      if (error) return toast({ title: "Could not send", description: error.message, variant: "destructive" });
      qc.invalidateQueries({ queryKey: ["threads"] });
    }
    setSubject("");
    setBody("");
    toast({ title: "Message sent", description: `Sent to ${label(to)}.` });
  };

  const demoMine = demo.messages.filter((m) => m.studentId === student?.id);

  return (
    <PortalPage title="Communication" description="Announcements from school and conversations with staff" actions={<ChildSwitcher />}>
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="mt-4"><AnnouncementFeed /></TabsContent>
        <TabsContent value="inbox" className="mt-4"><NotificationsView audience="parent" /></TabsContent>
        <TabsContent value="message" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">New message</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="msg-to">To</Label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger id="msg-to"><SelectValue /></SelectTrigger>
                    <SelectContent>{RECIPIENTS.map((r) => <SelectItem key={r} value={r}>{label(r)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="msg-subject">Subject</Label>
                  <Input id="msg-subject" maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="msg-body">Message</Label>
                  <Textarea id="msg-body" rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div>
                  <Button type="submit" className="gap-1" disabled={busy || !student || !subject.trim() || !body.trim()}>
                    <Send className="h-4 w-4" /> Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {isLive ? (
            <ThreadsPanel threads={threads.data ?? []} emptyText="No conversations yet. Staff replies will appear here." />
          ) : (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Sent messages (sample account — staff can't reply)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {demoMine.length === 0 && (
                  <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><MessageSquare className="h-4 w-4" /> No messages sent yet.</p>
                )}
                {demoMine.map((m) => (
                  <div key={m.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">To {m.to}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
