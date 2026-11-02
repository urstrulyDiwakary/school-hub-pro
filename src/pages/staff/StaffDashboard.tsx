// Staff dashboard: one live to-do list across attendance, marks, notices
// and parent messages, for teachers, the accounts office and the admin.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Megaphone,
  MessageSquare,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { useLiveStudents } from "@/hooks/useLiveSchool";
import { useThreads } from "@/components/messages/MessageThreads";
import { useAnnouncements } from "@/lib/announcementStore";
import { buildStaffTodos, type StaffTodo } from "@/lib/staffTodo";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneIcon: Record<StaffTodo["id"], React.ComponentType<{ className?: string }>> = {
  attendance: CalendarCheck,
  marks: ClipboardList,
  notices: Megaphone,
  messages: MessageSquare,
};

const toneClasses: Record<StaffTodo["tone"], string> = {
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

export default function StaffDashboard() {
  const user = useAuthStore((s) => s.user);
  const students = useLiveStudents(!!user?.live);
  const threads = useThreads();
  const { items: notices } = useAnnouncements(user?.role);
  const today = new Date().toISOString().slice(0, 10);

  const classes = useMemo(() => {
    const set = new Set<string>();
    (students.data ?? []).forEach((s) => set.add(`${s.class_name}|${s.section}`));
    return set;
  }, [students.data]);

  const attToday = useQuery({
    queryKey: ["staff-todo-att", today],
    enabled: !!user?.live,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("student_id")
        .eq("date", today);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.student_id));
    },
  });

  const resultStudents = useQuery({
    queryKey: ["staff-todo-results"],
    enabled: !!user?.live,
    queryFn: async () => {
      const { data, error } = await supabase.from("exam_results").select("student_id");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.student_id));
    },
  });

  const threadIds = (threads.data ?? []).map((t) => t.id);
  const msgs = useQuery({
    queryKey: ["staff-todo-msgs", threadIds.join(",")],
    enabled: !!user?.live && threadIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thread_messages")
        .select("thread_id, sender_id, created_at")
        .in("thread_id", threadIds)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const waitingReply = useMemo(() => {
    if (!threads.data) return 0;
    const last = new Map<string, string>();
    (msgs.data ?? []).forEach((m) => last.set(m.thread_id, m.sender_id));
    return threads.data.filter((t) => {
      const sender = last.get(t.id);
      return sender ? sender === t.parent_id : true;
    }).length;
  }, [threads.data, msgs.data]);

  const noticesLast7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return notices.filter((n) => new Date(n.createdAt).getTime() >= cutoff).length;
  }, [notices]);

  const classesMarkedToday = useMemo(() => {
    const marked = attToday.data;
    if (!marked) return 0;
    let n = 0;
    classes.forEach((c) => {
      const inClass = (students.data ?? []).some((s) => `${s.class_name}|${s.section}` === c && marked.has(s.id));
      if (inClass) n += 1;
    });
    return n;
  }, [attToday.data, classes, students.data]);

  if (!user?.live)
    return (
      <div className="space-y-6">
        <PageHeader title="Staff to-do" description="Attendance, marks, notices and parent messages for today." />
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          This dashboard follows your real school records, so it needs a real staff account. Sign out and sign in with
          the account your school admin created.
        </p>
      </div>
    );

  const todos = buildStaffTodos({
    totalClasses: classes.size,
    classesMarkedToday,
    studentsWithResults: resultStudents.data?.size ?? 0,
    totalStudents: students.data?.length ?? 0,
    noticesLast7,
    threadsAwaitingReply: waitingReply,
  });

  const pending = todos.filter((t) => !t.done).length;

  const stats = [
    { label: "Students", value: students.data?.length ?? 0, icon: Users, tone: "text-primary" },
    { label: "Classes marked today", value: `${classesMarkedToday}/${classes.size}`, icon: CalendarCheck, tone: "text-success" },
    { label: "Messages waiting", value: waitingReply, icon: MessageSquare, tone: waitingReply ? "text-destructive" : "text-success" },
    { label: "Notices this week", value: noticesLast7, icon: Megaphone, tone: "text-warning" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`To-do for ${user.name.split(" ")[0]}`}
        description="Attendance, marks, notices and parent messages for today."
      />

      <div className="responsive-grid-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{s.value}</p>
              </div>
              <s.icon className={cn("h-5 w-5 shrink-0 sm:h-6 sm:w-6", s.tone)} />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="h-4 w-4" /> Today's to-do
          </CardTitle>
          <Badge variant={pending === 0 ? "secondary" : "destructive"} className="shrink-0">
            {pending === 0 ? "All done" : `${pending} to do`}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {todos.map((t) => {
            const Icon = toneIcon[t.id];
            return (
              <div
                key={t.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border p-3",
                  t.done && "opacity-70",
                )}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[t.tone])}>
                  {t.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Icon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
                <Button asChild size="sm" variant={t.done ? "ghost" : "outline"} className="gap-1">
                  <Link to={t.to}>
                    {t.done ? "Open" : "Do it"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
