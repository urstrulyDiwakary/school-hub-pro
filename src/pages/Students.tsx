import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Download, Eye, Pencil, ArrowRightLeft, UserX, Mail, MessageSquare, FileText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CombinedExportDialog from "@/components/students/CombinedExportDialog";
import E2EStudentDetailFixture from "@/components/teacher/E2EStudentDetailFixture";
import { resolveEffectivePermissions } from "@/lib/userRole";

interface StudentRow {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  parentName: string;
  mobile: string;
  email: string;
  status: "active" | "inactive";
  gender: "Male" | "Female";
  avatar?: string;
}

const studentsData: StudentRow[] = [
  { id: "1", admissionNo: "ADM2024001", name: "Arjun Sharma", class: "10", section: "A", parentName: "Rajesh Sharma", mobile: "+91 98765 43210", email: "arjun@school.edu", status: "active", gender: "Male" },
  { id: "2", admissionNo: "ADM2024002", name: "Priya Patel", class: "10", section: "A", parentName: "Vikram Patel", mobile: "+91 98765 43211", email: "priya@school.edu", status: "active", gender: "Female" },
  { id: "3", admissionNo: "ADM2024003", name: "Rahul Kumar", class: "9", section: "B", parentName: "Suresh Kumar", mobile: "+91 98765 43212", email: "rahul@school.edu", status: "active", gender: "Male" },
  { id: "4", admissionNo: "ADM2024004", name: "Sneha Reddy", class: "8", section: "A", parentName: "Krishna Reddy", mobile: "+91 98765 43213", email: "sneha@school.edu", status: "inactive", gender: "Female" },
  { id: "5", admissionNo: "ADM2024005", name: "Amit Singh", class: "10", section: "B", parentName: "Harpreet Singh", mobile: "+91 98765 43214", email: "amit@school.edu", status: "active", gender: "Male" },
  { id: "6", admissionNo: "ADM2024006", name: "Kavya Nair", class: "9", section: "A", parentName: "Sunil Nair", mobile: "+91 98765 43215", email: "kavya@school.edu", status: "active", gender: "Female" },
  { id: "7", admissionNo: "ADM2024007", name: "Rohan Gupta", class: "8", section: "B", parentName: "Anil Gupta", mobile: "+91 98765 43216", email: "rohan@school.edu", status: "active", gender: "Male" },
  { id: "8", admissionNo: "ADM2024008", name: "Ananya Verma", class: "7", section: "A", parentName: "Sanjay Verma", mobile: "+91 98765 43217", email: "ananya@school.edu", status: "active", gender: "Female" },
  { id: "9", admissionNo: "ADM2024009", name: "Vikram Reddy", class: "10", section: "A", parentName: "Mohan Reddy", mobile: "+91 98765 43218", email: "vikram@school.edu", status: "active", gender: "Male" },
  { id: "10", admissionNo: "ADM2024010", name: "Meera Iyer", class: "9", section: "A", parentName: "Ganesh Iyer", mobile: "+91 98765 43219", email: "meera@school.edu", status: "active", gender: "Female" },
  { id: "11", admissionNo: "ADM2024011", name: "Aditya Joshi", class: "11", section: "B", parentName: "Deepak Joshi", mobile: "+91 98765 43220", email: "aditya@school.edu", status: "active", gender: "Male" },
  { id: "12", admissionNo: "ADM2024012", name: "Shreya Das", class: "12", section: "A", parentName: "Bibhuti Das", mobile: "+91 98765 43221", email: "shreya@school.edu", status: "active", gender: "Female" },
];

const classes = ["6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "muted" | "primary" }) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function Students() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [quickView, setQuickView] = useState<StudentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [combinedOpen, setCombinedOpen] = useState(false);
  const [combinedSelection, setCombinedSelection] = useState<StudentRow[]>([]);

  const perms = resolveEffectivePermissions();
  const canCombine = perms.pdf && perms.effectiveRole === "admin";

  const data = useMemo(
    () =>
      studentsData.filter(
        (s) =>
          (!selectedClass || s.class === selectedClass) &&
          (!selectedSection || s.section === selectedSection) &&
          (!selectedGender || s.gender === selectedGender),
      ),
    [selectedClass, selectedSection, selectedGender],
  );

  const activeFilters: ActiveFilter[] = [
    selectedClass && { key: "class", label: "Class", value: selectedClass, onRemove: () => setSelectedClass("") },
    selectedSection && { key: "section", label: "Section", value: selectedSection, onRemove: () => setSelectedSection("") },
    selectedGender && { key: "gender", label: "Gender", value: selectedGender, onRemove: () => setSelectedGender("") },
  ].filter(Boolean) as ActiveFilter[];

  const columns: ColumnDef<StudentRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Student",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={s.avatar} alt={s.name} />
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials(s.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.gender}</p>
              </div>
            </div>
          );
        },
      },
      { accessorKey: "admissionNo", header: "Admission No.", cell: (c) => <span className="font-mono text-sm">{c.getValue<string>()}</span> },
      {
        id: "class",
        header: "Class",
        accessorFn: (r) => `${r.class}-${r.section}`,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{getValue<string>()}</span>
        ),
      },
      { accessorKey: "parentName", header: "Parent" },
      { accessorKey: "mobile", header: "Mobile", cell: (c) => <span className="text-muted-foreground">{c.getValue<string>()}</span> },
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

  const bulkActions: BulkAction<StudentRow>[] = [
    { label: "Bulk Edit", icon: <Pencil className="mr-1 h-3.5 w-3.5" />, onClick: (rows) => toast.info(`Bulk edit ${rows.length} students`) },
    { label: "Export", icon: <Download className="mr-1 h-3.5 w-3.5" />, onClick: (rows) => toast.success(`Exported ${rows.length} rows`) },
    { label: "SMS", icon: <MessageSquare className="mr-1 h-3.5 w-3.5" />, onClick: (rows) => toast.success(`SMS queued for ${rows.length} parents`) },
    { label: "Email", icon: <Mail className="mr-1 h-3.5 w-3.5" />, onClick: (rows) => toast.success(`Email queued for ${rows.length} parents`) },
    ...(canCombine
      ? [{
          label: "Combined PDF",
          icon: <FileText className="mr-1 h-3.5 w-3.5" />,
          onClick: (rows: StudentRow[]) => { setCombinedSelection(rows); setCombinedOpen(true); },
        }]
      : []),
  ];

  const rowActions: RowAction<StudentRow>[] = [
    { label: "Quick view", onClick: (r) => setQuickView(r) },
    { label: "Open profile", onClick: (r) => navigate(`/students/${r.id}`) },
    { label: "Transfer class", onClick: (r) => toast.info(`Transfer ${r.name}`) },
    { label: "Deactivate", destructive: true, onClick: (r) => setDeleteTarget(r) },
  ];

  const exportCsv = (rows: StudentRow[]) => {
    const header = ["Admission No", "Name", "Class", "Section", "Parent", "Mobile", "Status"];
    const body = rows.map((r) => [r.admissionNo, r.name, r.class, r.section, r.parentName, r.mobile, r.status]);
    const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "students.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} students`);
  };

  return (
    <PageLayout
      title="Students"
      description="Manage all student records and information"
      breadcrumbs={[{ label: "People" }, { label: "Students" }]}
      actions={
        <Link to="/students/add">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Student</Button>
        </Link>
      }
      stats={
        <StatisticsRow>
          <StatCard label="Total Students" value="2,847" />
          <StatCard label="Active" value="2,798" tone="success" />
          <StatCard label="Inactive" value="49" tone="muted" />
          <StatCard label="New This Month" value="24" tone="primary" />
        </StatisticsRow>
      }
      filters={
        <FilterBar active={activeFilters} onClearAll={() => { setSelectedClass(""); setSelectedSection(""); setSelectedGender(""); }}>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
          </Select>
        </FilterBar>
      }
    >
      <E2EStudentDetailFixture />
      <DataTableV2
        tableId="students"
        data={data}
        columns={columns}
        searchPlaceholder="Search by name, admission no, parent…"
        bulkActions={bulkActions}
        rowActions={rowActions}
        onRowClick={(r) => setQuickView(r)}
        onExportCsv={exportCsv}
        emptyTitle="No students match"
        emptyDescription="Try clearing filters or refining the search."
        stickyFirstColumn
      />

      <AppDrawer
        open={!!quickView}
        onOpenChange={(v) => !v && setQuickView(null)}
        title={quickView?.name}
        description={quickView ? `${quickView.admissionNo} · Class ${quickView.class}-${quickView.section}` : undefined}
        size="md"
        footer={
          quickView && (
            <>
              <Button variant="outline" onClick={() => setQuickView(null)}>Close</Button>
              <Button onClick={() => { const id = quickView.id; setQuickView(null); navigate(`/students/${id}`); }}>
                <Eye className="mr-1.5 h-4 w-4" /> Open profile
              </Button>
            </>
          )
        }
      >
        {quickView && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-caption">Parent</dt><dd className="mt-0.5 font-medium">{quickView.parentName}</dd></div>
            <div><dt className="text-caption">Mobile</dt><dd className="mt-0.5 font-medium">{quickView.mobile}</dd></div>
            <div><dt className="text-caption">Email</dt><dd className="mt-0.5 truncate font-medium">{quickView.email}</dd></div>
            <div><dt className="text-caption">Gender</dt><dd className="mt-0.5 font-medium">{quickView.gender}</dd></div>
            <div><dt className="text-caption">Status</dt><dd className="mt-0.5"><span className={quickView.status === "active" ? "badge-active" : "badge-inactive"}>{quickView.status}</span></dd></div>
          </dl>
        )}
      </AppDrawer>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Deactivate student?"
        description={deleteTarget ? `${deleteTarget.name} will no longer appear in active rosters.` : ""}
        confirmLabel="Deactivate"
        onConfirm={() => {
          const name = deleteTarget?.name;
          setDeleteTarget(null);
          toast.success(`${name} deactivated`, {
            action: { label: "Undo", onClick: () => toast.info(`${name} restored`) },
          });
        }}
      />

      <CombinedExportDialog
        open={combinedOpen}
        onOpenChange={setCombinedOpen}
        students={combinedSelection.map((s) => ({ id: s.id, admissionNo: s.admissionNo, name: s.name, className: `${s.class}-${s.section}` }))}
      />
    </PageLayout>
  );
}
