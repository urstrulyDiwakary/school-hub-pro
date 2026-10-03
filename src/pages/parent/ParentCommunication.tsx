import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { NotificationsView } from "@/components/portal/features/NotificationsView";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveStudent } from "@/hooks/useActiveStudent";
import { useParentMessages } from "@/lib/parentMessageStore";
import { toast } from "@/hooks/use-toast";

export default function ParentCommunication() {
  const { student } = useActiveStudent();
  const { messages, send } = useParentMessages();
  const recipients = [student ? `Class Teacher (${student.academic.classTeacher})` : "Class Teacher", "Principal", "Accounts Office", "Transport Desk"];
  const [to, setTo] = useState(recipients[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const mine = messages.filter((m) => m.studentId === student?.id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !subject.trim() || !body.trim()) return;
    send({ studentId: student.id, to, subject: subject.trim().slice(0, 120), body: body.trim().slice(0, 2000) });
    setSubject("");
    setBody("");
    toast({ title: "Message sent", description: `Sent to ${to}.` });
  };

  return (
    <PortalPage title="Communication" description="Announcements from school and messages to staff" actions={<ChildSwitcher />}>
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="message">Message school</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="mt-4">
          <AnnouncementFeed />
        </TabsContent>
        <TabsContent value="inbox" className="mt-4">
          <NotificationsView audience="parent" />
        </TabsContent>
        <TabsContent value="message" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">New message</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="msg-to">To</Label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger id="msg-to"><SelectValue /></SelectTrigger>
                    <SelectContent>{recipients.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="msg-subject">Subject</Label>
                  <Input id="msg-subject" maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="msg-body">Message</Label>
                  <Textarea id="msg-body" rows={5} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <Button type="submit" className="gap-1" disabled={!student || !subject.trim() || !body.trim()}>
                  <Send className="h-4 w-4" /> Send
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Sent messages</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mine.length === 0 && (
                <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><MessageSquare className="h-4 w-4" /> No messages sent yet.</p>
              )}
              {mine.map((m) => (
                <div key={m.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">To {m.to} · {new Date(m.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
