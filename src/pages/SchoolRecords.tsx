import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, Plus, Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { useLiveStudents } from "@/hooks/useLiveSchool";
import { makeCode } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

const STATUSES = ["present", "late", "absent", "holiday"] as const;
const DEFAULT_SUBJECTS = "Mathematics, Science, English, Social Studies, Hindi";
const err = (e: { message: string } | null) => e && toast({ title: "Could not save", description: e.message, variant: "destructive" });

function StudentsTab() {
  const qc = useQueryClient();
  const students = useLiveStudents();
  const codes = useQuery({
    queryKey: ["join-codes"],
    queryFn: async () => (await supabase.from("student_join_codes").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [f, setF] = useState({ name: "", cls: "", section: "A", roll: "", teacher: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.cls.trim()) return;
    const { error } = await supabase.from("students").insert({
      full_name: f.name.trim(), class_name: f.cls.trim(), section: f.section.trim() || "A",
      roll_no: f.roll ? Number(f.roll) : null, class_teacher: f.teacher.trim(),
    });
    if (err(error)) return;
    setF({ ...f, name: "", roll: "" });
    qc.invalidateQueries({ queryKey: ["live-students"] });
  };
  const newCode = async (studentId: string) => {
    const { error } = await supabase.from("student_join_codes").insert({ code: makeCode(), student_id: studentId });
    if (!err(error)) qc.invalidateQueries({ queryKey: ["join-codes"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this student and all their records?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!err(error)) qc.invalidateQueries({ queryKey: ["live-students"] });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Add student</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-1 lg:col-span-2"><Label htmlFor="st-name">Name</Label><Input id="st-name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="st-cls">Class</Label><Input id="st-cls" required placeholder="Class 7" value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="st-sec">Section</Label><Input id="st-sec" value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="st-roll">Roll no.</Label><Input id="st-roll" type="number" value={f.roll} onChange={(e) => setF({ ...f, roll: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="st-t">Class teacher</Label><Input id="st-t" value={f.teacher} onChange={(e) => setF({ ...f, teacher: e.target.value })} /></div>
            <div><Button type="submit" className="gap-1"><Plus className="h-4 w-4" /> Add</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Students and parent codes</CardTitle></CardHeader>
        <CardContent className="scroll-x-mobile">
          {!students.data?.length ? <p className="text-sm text-muted-foreground">No students yet.</p> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Class</th><th>Parent code</th><th /></tr></thead>
              <tbody>
                {students.data.map((s) => {
                  const c = codes.data?.find((x) => x.student_id === s.id && !x.used_by);
                  const used = codes.data?.filter((x) => x.student_id === s.id && x.used_by).length ?? 0;
                  return (
                    <tr key={s.id}>
                      <td className="font-medium">{s.full_name}</td>
                      <td>{s.class_name}-{s.section}{s.roll_no ? ` · #${s.roll_no}` : ""}</td>
                      <td>
                        {c ? (
                          <button type="button" className="inline-flex items-center gap-1 font-mono text-sm" onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: "Code copied" }); }}>
                            {c.code} <Copy className="h-3 w-3" />
                          </button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => newCode(s.id)}><KeyRound className="h-3 w-3" /> New code</Button>
                        )}
                        {used > 0 && <span className="ml-2 text-xs text-muted-foreground">{used} parent(s) linked</span>}
                      </td>
                      <td><Button size="icon" variant="ghost" aria-label={`Delete ${s.full_name}`} onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function useClasses() {
  const students = useLiveStudents();
  const classes = useMemo(
    () => [...new Set((students.data ?? []).map((s) => `${s.class_name}|${s.section}`))].sort(),
    [students.data],
  );
  return { students: students.data ?? [], classes };
}

function AttendanceTab() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { students, classes } = useClasses();
  const [cls, setCls] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, string>>({});
  const active = cls || classes[0] || "";
  const list = students.filter((s) => `${s.class_name}|${s.section}` === active);

  useQuery({
    queryKey: ["att-day", active, date, list.length],
    enabled: list.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("attendance_records").select("student_id,status").eq("date", date).in("student_id", list.map((s) => s.id));
      const m: Record<string, string> = {};
      list.forEach((s) => (m[s.id] = data?.find((d) => d.student_id === s.id)?.status ?? "present"));
      setMarks(m);
      return m;
    },
  });

  const save = async () => {
    const rows = list.map((s) => ({ student_id: s.id, date, status: marks[s.id] ?? "present", marked_by: user?.id, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("attendance_records").upsert(rows, { onConflict: "student_id,date" });
    if (err(error)) return;
    qc.invalidateQueries({ queryKey: ["live-attendance"] });
    toast({ title: "Attendance saved", description: "Parents can see it now." });
  };

  if (!classes.length) return <p className="text-sm text-muted-foreground">Add students first.</p>;
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-end gap-3 pb-2">
        <div className="space-y-1"><Label>Class</Label>
          <Select value={active} onValueChange={setCls}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c.replace("|", " - ")}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label htmlFor="att-date">Date</Label><Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <Button onClick={save}>Save attendance</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2">
            <span className="text-sm font-medium">{s.full_name}</span>
            <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${s.full_name}`}>
              {STATUSES.map((st) => (
                <Button key={st} type="button" size="sm" role="radio" aria-checked={marks[s.id] === st}
                  variant={marks[s.id] === st ? "default" : "outline"} onClick={() => setMarks({ ...marks, [s.id]: st })} className="capitalize">{st}</Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MarksTab() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { students, classes } = useClasses();
  const [cls, setCls] = useState("");
  const [exam, setExam] = useState({ name: "", term: "Term 1", date: new Date().toISOString().slice(0, 10), max: "100", subjects: DEFAULT_SUBJECTS });
  const [grid, setGrid] = useState<Record<string, Record<string, string>>>({});
  const active = cls || classes[0] || "";
  const list = students.filter((s) => `${s.class_name}|${s.section}` === active);
  const subjects = exam.subjects.split(",").map((s) => s.trim()).filter(Boolean);

  const save = async () => {
    if (!exam.name.trim()) return toast({ title: "Enter the exam name", variant: "destructive" });
    const max = Number(exam.max) || 100;
    const totals = list.map((s) => ({ s, total: subjects.reduce((a, sub) => a + (Number(grid[s.id]?.[sub]) || 0), 0) }));
    const ranked = [...totals].sort((a, b) => b.total - a.total);
    const rows = totals
      .filter(({ s }) => subjects.some((sub) => grid[s.id]?.[sub] !== undefined && grid[s.id][sub] !== ""))
      .map(({ s }) => ({
        student_id: s.id, exam_name: exam.name.trim(), term: exam.term, exam_date: exam.date, created_by: user?.id,
        subjects: subjects.map((sub) => ({ subject: sub, marks: Math.min(max, Math.max(0, Number(grid[s.id]?.[sub]) || 0)), maxMarks: max })),
        class_rank: ranked.findIndex((r) => r.s.id === s.id) + 1, total_students: list.length,
      }));
    if (!rows.length) return toast({ title: "Enter some marks first", variant: "destructive" });
    const { error } = await supabase.from("exam_results").insert(rows);
    if (err(error)) return;
    qc.invalidateQueries({ queryKey: ["live-results"] });
    setGrid({});
    toast({ title: "Marks saved", description: `${rows.length} student result(s) published to parents.` });
  };

  if (!classes.length) return <p className="text-sm text-muted-foreground">Add students first.</p>;
  return (
    <Card>
      <CardHeader className="space-y-3 pb-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1"><Label>Class</Label>
            <Select value={active} onValueChange={setCls}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c.replace("|", " - ")}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label htmlFor="ex-name">Exam</Label><Input id="ex-name" placeholder="Unit Test 1" value={exam.name} onChange={(e) => setExam({ ...exam, name: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ex-term">Term</Label><Input id="ex-term" value={exam.term} onChange={(e) => setExam({ ...exam, term: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ex-date">Date</Label><Input id="ex-date" type="date" value={exam.date} onChange={(e) => setExam({ ...exam, date: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ex-max">Max marks</Label><Input id="ex-max" type="number" value={exam.max} onChange={(e) => setExam({ ...exam, max: e.target.value })} /></div>
        </div>
        <div className="space-y-1"><Label htmlFor="ex-sub">Subjects (comma separated)</Label><Input id="ex-sub" value={exam.subjects} onChange={(e) => setExam({ ...exam, subjects: e.target.value })} /></div>
      </CardHeader>
      <CardContent className="scroll-x-mobile space-y-3">
        <table className="data-table">
          <thead><tr><th>Student</th>{subjects.map((s) => <th key={s}>{s}</th>)}</tr></thead>
          <tbody>
            {list.map((st) => (
              <tr key={st.id}>
                <td className="font-medium">{st.full_name}</td>
                {subjects.map((sub) => (
                  <td key={sub}><Input aria-label={`${sub} marks for ${st.full_name}`} type="number" className="h-8 w-20" value={grid[st.id]?.[sub] ?? ""}
                    onChange={(e) => setGrid({ ...grid, [st.id]: { ...grid[st.id], [sub]: e.target.value } })} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={save}>Save and publish marks</Button>
      </CardContent>
    </Card>
  );
}

function StaffTab() {
  const [f, setF] = useState({ fullName: "", email: "", password: "", role: "teacher" });
  const [picked, setPicked] = useState<string[]>([]);
  const studentsQ = useLiveStudents(f.role === "student");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("manage-staff", { body: f.role === "student" ? { ...f, studentIds: picked } : f });
    setBusy(false);
    const msg = (data as { error?: string } | null)?.error ?? error?.message;
    if (msg) return toast({ title: "Could not add staff", description: msg, variant: "destructive" });
    toast({ title: "Staff account created", description: `Share the email and password with ${f.fullName}.` });
    setF({ fullName: "", email: "", password: "", role: f.role });
    setPicked([]);
  };
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Add a staff login</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="sf-n">Full name</Label><Input id="sf-n" required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="sf-e">Email</Label><Input id="sf-e" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="sf-p">Starting password</Label><Input id="sf-p" type="text" minLength={8} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <div className="space-y-1"><Label>Role</Label>
            <Select value={f.role} onValueChange={(role) => setF({ ...f, role })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="accountant">Accounts office</SelectItem><SelectItem value="school_admin">School admin</SelectItem><SelectItem value="student">Student</SelectItem></SelectContent></Select></div>
          {f.role === "student" && (
            <fieldset className="space-y-1 sm:col-span-2">
              <legend className="text-sm font-medium">Student record(s) this login can see</legend>
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border p-2">
                {(studentsQ.data ?? []).map((s) => (
                  <label key={s.id} className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={picked.includes(s.id)}
                      onChange={(e) => setPicked(e.target.checked ? [...picked, s.id] : picked.filter((x) => x !== s.id))} />
                    {s.full_name} ({s.class_name}-{s.section})
                  </label>
                ))}
                {!studentsQ.data?.length && <span className="text-sm text-muted-foreground">Add students first.</span>}
              </div>
            </fieldset>
          )}
          <div><Button type="submit" className="gap-1" disabled={busy}><UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Create login"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SchoolRecords() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "school_admin";
  return (
    <div className="space-y-6">
      <PageHeader title="Live school records" description="Students, parent codes, attendance and marks that parents see right away." />
      {!user?.live ? (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          This page saves real records, so it needs a real account. Sign out and sign in with your school account
          (or create the admin account from the sign-in page).
        </p>
      ) : (
        <Tabs defaultValue="attendance">
          <TabsList className="flex-wrap">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="marks">Marks</TabsTrigger>
            <TabsTrigger value="students">Students & codes</TabsTrigger>
            {isAdmin && <TabsTrigger value="staff">Staff logins</TabsTrigger>}
          </TabsList>
          <TabsContent value="attendance" className="mt-4"><AttendanceTab /></TabsContent>
          <TabsContent value="marks" className="mt-4"><MarksTab /></TabsContent>
          <TabsContent value="students" className="mt-4"><StudentsTab /></TabsContent>
          {isAdmin && <TabsContent value="staff" className="mt-4"><StaffTab /></TabsContent>}
        </Tabs>
      )}
    </div>
  );
}
