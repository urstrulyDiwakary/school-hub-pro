import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Download, Eye, Pencil, Mail, MessageSquare, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PageLayout,
  StatisticsRow,
  FilterBar,
  DataTableV2,
  AppDrawer,
  DeleteDialog,
  type ActiveFilter,
  type BulkAction,
  type RowAction,
} from "@/components/app";
import { toast } from "sonner";

interface TeacherRow {
  id: string;
  employeeId: string;
  name: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  experience: string;
  status: "active" | "inactive";
  email: string;
  mobile: string;
}

const teachersData: TeacherRow[] = [
  { id: "1", employeeId: "EMP001", name: "Dr. Ramesh Kumar", subjects: ["Mathematics", "Physics"], classes: ["10-A", "10-B", "11-A"], qualification: "Ph.D Mathematics", experience: "15 years", status: "active", email: "ramesh.kumar@school.edu", mobile: "+91 98765 43210" },
  { id: "2", employeeId: "EMP002", name: "Priya Sharma", subjects: ["English", "Literature"], classes: ["8-A", "8-B", "9-A"], qualification: "M.A English", experience: "8 years", status: "active", email: "priya.sharma@school.edu", mobile: "+91 98765 43211" },
  { id: "3", employeeId: "EMP003", name: "Suresh Patel", subjects: ["Science", "Biology"], classes: ["6-A", "6-B", "7-A"], qualification: "M.Sc Biology", experience: "10 years", status: "active", email: "suresh.patel@school.edu", mobile: "+91 98765 43212" },
  { id: "4", employeeId: "EMP004", name: "Anita Reddy", subjects: ["Hindi"], classes: ["5-A", "5-B", "6-A"], qualification: "M.A Hindi", experience: "6 years", status: "inactive", email: "anita.reddy@school.edu", mobile: "+91 98765 43213" },
  { id: "5", employeeId: "EMP005", name: "Dr. Meena Iyer", subjects: ["Chemistry"], classes: ["11-A", "11-B", "12-A"], qualification: "Ph.D Chemistry", experience: "12 years", status: "active", email: "meena.iyer@school.edu", mobile: "+91 98765 43214" },
  { id: "6", employeeId: "EMP006", name: "Rajesh Nair", subjects: ["Computer Science"], classes: ["9-A", "10-A", "10-B"], qualification: "M.Tech CS", experience: "9 years", status: "active", email: "rajesh.nair@school.edu", mobile: "+91 98765 43215" },
  { id: "7", employeeId: "EMP007", name: "Sunita Joshi", subjects: ["Social Studies", "History"], classes: ["7-A", "7-B", "8-A"], qualification: "M.A History", experience: "11 years", status: "active", email: "sunita.joshi@school.edu", mobile: "+91 98765 43216" },
  { id: "8", employeeId: "EMP008", name: "Arvind Menon", subjects: ["Physics"], classes: ["11-A", "12-A", "12-B"], qualification: "M.Sc Physics", experience: "14 years", status: "active", email: "arvind.menon@school.edu", mobile: "+91 98765 43217" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "primary" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${t}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function Teachers() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [quickView, setQuickView] = useState<TeacherRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRow | null>(null);

  const allSubjects = useMemo(() => Array.from(new Set(teachersData.flatMap((t) => t.subjects))).sort(), []);

  const data = useMemo(
    () =>
      teachersData.filter(
        (t) => (!subject || t.subjects.includes(subject)) && (!status || t.status === status),
      ),
    [subject, status],
  );

  const active: ActiveFilter[] = [
    subject && { key: "subject", label: "Subject", value: subject, onRemove: () => setSubject("") },
    status && { key: "status", label: "Status", value: status, onRemove: () => setStatus("") },
  ].filter(Boolean) as ActiveFilter[];

  const columns: ColumnDef<TeacherRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Teacher",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-success/10 text-xs font-medium text-success">{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "employeeId", header: "Employee ID", cell: (c) => <span className="font-mono text-sm">{c.getValue<string>()}</span> },
      {
        accessorKey: "subjects",
        header: "Subjects",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.subjects.map((s) => (
              <span key={s} className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{s}</span>
            ))}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "classes",
        header: "Classes",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.classes.slice(0, 2).map((c) => (
              <span key={c} className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c}</span>
            ))}
            {row.original.classes.length > 2 && (
              <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{row.original.classes.length - 2}</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      { accessorKey: "experience", header: "Experience", cell: (c) => <span className="text-muted-foreground">{c.getValue<string>()}</span> },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => (
          <span className={c.getValue<string>() === "active" ? "badge-active" : "badge-inactive"}>
            {c.getValue<string>() === "active" ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  const bulkActions: BulkAction<TeacherRow>[] = [
    { label: "Bulk Edit", icon: <Pencil className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.info(`Bulk edit ${r.length}`) },
    { label: "Export", icon: <Download className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`Exported ${r.length}`) },
    { label: "SMS", icon: <MessageSquare className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`SMS queued for ${r.length}`) },
    { label: "Email", icon: <Mail className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`Email queued for ${r.length}`) },
  ];

  const rowActions: RowAction<TeacherRow>[] = [
    { label: "Quick view", onClick: (r) => setQuickView(r) },
    { label: "Open profile", onClick: (r) => navigate(`/teachers/${r.id}`) },
    { label: "Edit", onClick: (r) => toast.info(`Edit ${r.name}`) },
    { label: "Remove", destructive: true, onClick: (r) => setDeleteTarget(r) },
  ];

  const exportCsv = (rows: TeacherRow[]) => {
    const header = ["Employee ID", "Name", "Subjects", "Classes", "Experience", "Status"];
    const body = rows.map((r) => [r.employeeId, r.name, r.subjects.join("; "), r.classes.join("; "), r.experience, r.status]);
    const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "teachers.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} teachers`);
  };

  return (
    <PageLayout
      title="Teachers"
      description="Manage teaching staff records and assignments"
      breadcrumbs={[{ label: "People" }, { label: "Teachers" }]}
      actions={<Link to="/teachers/add"><Button className="gap-2"><Plus className="h-4 w-4" /> Add Teacher</Button></Link>}
      stats={
        <StatisticsRow>
          <StatCard label="Total Teachers" value="156" />
          <StatCard label="Active" value="152" tone="success" />
          <StatCard label="On Leave" value="4" tone="warning" />
          <StatCard label="Class Teachers" value="48" tone="primary" />
        </StatisticsRow>
      }
      filters={
        <FilterBar active={active} onClearAll={() => { setSubject(""); setStatus(""); }}>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>{allSubjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
          </Select>
        </FilterBar>
      }
    >
      <DataTableV2
        tableId="teachers"
        data={data}
        columns={columns}
        searchPlaceholder="Search by name, employee ID, subject…"
        bulkActions={bulkActions}
        rowActions={rowActions}
        onRowClick={(r) => setQuickView(r)}
        onExportCsv={exportCsv}
        emptyTitle="No teachers found"
        stickyFirstColumn
      />

      <AppDrawer
        open={!!quickView}
        onOpenChange={(v) => !v && setQuickView(null)}
        title={quickView?.name}
        description={quickView ? `${quickView.employeeId} · ${quickView.qualification}` : undefined}
        footer={quickView && (
          <>
            <Button variant="outline" onClick={() => setQuickView(null)}>Close</Button>
            <Button onClick={() => { const id = quickView.id; setQuickView(null); navigate(`/teachers/${id}`); }}>
              <Eye className="mr-1.5 h-4 w-4" /> Open profile
            </Button>
          </>
        )}
      >
        {quickView && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-caption">Experience</dt><dd className="mt-0.5 font-medium">{quickView.experience}</dd></div>
            <div><dt className="text-caption">Mobile</dt><dd className="mt-0.5 font-medium">{quickView.mobile}</dd></div>
            <div className="col-span-2"><dt className="text-caption">Subjects</dt><dd className="mt-1 flex flex-wrap gap-1">{quickView.subjects.map((s) => <span key={s} className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>)}</dd></div>
            <div className="col-span-2"><dt className="text-caption">Classes</dt><dd className="mt-1 flex flex-wrap gap-1">{quickView.classes.map((c) => <span key={c} className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">{c}</span>)}</dd></div>
          </dl>
        )}
      </AppDrawer>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove teacher?"
        description={deleteTarget ? `${deleteTarget.name} will be removed from active rosters.` : ""}
        onConfirm={() => {
          const name = deleteTarget?.name; setDeleteTarget(null);
          toast.success(`${name} removed`, { action: { label: "Undo", onClick: () => toast.info(`${name} restored`) } });
        }}
      />
    </PageLayout>
  );
}
