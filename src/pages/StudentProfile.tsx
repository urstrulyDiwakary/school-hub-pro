import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User, Phone, Mail, MapPin, BookOpen, CalendarDays, CreditCard, FileText,
  Heart, Bus, MessageSquare, History, ShieldCheck, GraduationCap, Home,
  Printer, Pencil, Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageLayout,
  ContentSection,
  EntityProfileLayout,
  ActivityTimeline,
  EmptyState,
  MaskedField,
  type EntityTab,
  type ActivityEvent,
} from "@/components/app";
import { StudentExportHistory } from "@/components/teacher/student-detail/StudentExportHistory";
import { toast } from "sonner";

const studentData = {
  id: "STU001",
  name: "Arjun Sharma",
  admissionNo: "ADM2024001",
  rollNo: 14,
  class: "10",
  section: "A",
  dob: "2009-06-15",
  gender: "Male",
  bloodGroup: "B+",
  aadhaar: "XXXX XXXX 4821",
  phone: "+91 98765 43210",
  email: "arjun.sharma@edutrack.in",
  address: "12, Green Park, New Delhi - 110016",
  fatherName: "Rohit Sharma",
  motherName: "Sunita Sharma",
  parentPhone: "+91 98111 22334",
  house: "Emerald",
  classTeacher: "Mrs. Anjali Verma",
  medical: {
    allergies: "None",
    conditions: "None",
    doctor: "Dr. K. Menon",
    doctorPhone: "+91 98100 00000",
  },
  transport: {
    route: "Route 7 · Green Park → School",
    busNo: "DL 1C 4432",
    pickup: "07:15 AM",
    driver: "Mr. Ravi Kumar",
  },
  attendance: { percentage: 92, present: 165, absent: 12, late: 3 },
  academics: { overallPercent: 81.7, rank: 4, grade: "A" },
  fees: { total: 85000, paid: 65000, pending: 20000 },
};

const activityEvents: ActivityEvent[] = [
  { id: "a1", time: "2024-11-10", user: "Dr. Ramesh Kumar", action: "Added remark", newValue: "Excellent problem solving", category: "remark" },
  { id: "a2", time: "2024-10-05", user: "Accounts", action: "Payment received", newValue: "₹15,000", category: "payment" },
  { id: "a3", time: "2024-09-28", user: "Mrs. Anjali Verma", action: "Marked attendance", newValue: "Present", category: "attendance" },
  { id: "a4", time: "2024-08-15", user: "Admin", action: "Uploaded document", newValue: "Medical Certificate", category: "document" },
  { id: "a5", time: "2024-04-01", user: "System", action: "Promoted to Class 10-A", category: "academic" },
];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-caption">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: "success" | "primary" | "warning" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className={`text-xl font-semibold ${t}`}>{value}</p>
      <p className="mt-0.5 text-caption">{label}</p>
    </div>
  );
}

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = studentData;

  const summary = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="mx-auto h-20 w-20 border-4 border-background shadow sm:mx-0">
        <AvatarImage src="" alt={s.name} />
        <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
          {s.name.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h2 className="text-h-page">{s.name}</h2>
          <Badge variant="outline" className="bg-success/10 text-success">Active</Badge>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-caption sm:justify-start">
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Class {s.class}-{s.section}</span>
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />Roll {s.rollNo}</span>
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{s.admissionNo}</span>
          <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{s.phone}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Attendance" value={`${s.attendance.percentage}%`} tone="primary" />
        <StatBox label="Overall" value={`${s.academics.overallPercent}%`} tone="success" />
        <StatBox label="Rank" value={`#${s.academics.rank}`} tone="warning" />
      </div>
    </div>
  );

  const actions = (
    <>
      <Button variant="outline" size="sm" onClick={() => toast.info("Edit profile")}><Pencil className="mr-1.5 h-4 w-4" /> Edit</Button>
      <Button variant="outline" size="sm" onClick={() => toast.success("ID card sent to printer")}><Printer className="mr-1.5 h-4 w-4" /> ID Card</Button>
      <Button size="sm" onClick={() => toast.success("Report downloaded")}><Download className="mr-1.5 h-4 w-4" /> Report</Button>
    </>
  );

  const tabs: EntityTab[] = useMemo(
    () => [
      {
        key: "overview", label: "Overview", icon: <User className="h-4 w-4" />,
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <ContentSection title="Personal">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Birth" value={new Date(s.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                <Field label="Gender" value={s.gender} />
                <Field label="Blood Group" value={s.bloodGroup} />
                <Field label="Aadhaar" value={<MaskedField value={s.aadhaar} />} />
                <Field label="Email" value={<span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{s.email}</span>} />
                <Field label="Phone" value={<span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{s.phone}</span>} />
                <div className="col-span-2"><Field label="Address" value={<span className="flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{s.address}</span>} /></div>
              </div>
            </ContentSection>
            <ContentSection title="Parent / Guardian">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Father" value={s.fatherName} />
                <Field label="Mother" value={s.motherName} />
                <Field label="Contact" value={s.parentPhone} />
                <Field label="House" value={s.house} />
                <div className="col-span-2"><Field label="Class Teacher" value={s.classTeacher} /></div>
              </div>
            </ContentSection>
          </div>
        ),
      },
      {
        key: "attendance", label: "Attendance", icon: <CalendarDays className="h-4 w-4" />,
        content: (
          <ContentSection title="Attendance Summary" description="Academic year 2024-25">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatBox label="Percentage" value={`${s.attendance.percentage}%`} tone="primary" />
              <StatBox label="Present" value={String(s.attendance.present)} tone="success" />
              <StatBox label="Absent" value={String(s.attendance.absent)} tone="warning" />
              <StatBox label="Late" value={String(s.attendance.late)} />
            </div>
            <Progress value={s.attendance.percentage} className="mt-4 h-2" />
          </ContentSection>
        ),
      },
      {
        key: "academics", label: "Academics", icon: <GraduationCap className="h-4 w-4" />,
        content: (
          <ContentSection title="Academic Performance">
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Overall" value={`${s.academics.overallPercent}%`} tone="success" />
              <StatBox label="Grade" value={s.academics.grade} tone="primary" />
              <StatBox label="Class Rank" value={`#${s.academics.rank}`} tone="warning" />
            </div>
          </ContentSection>
        ),
      },
      {
        key: "fees", label: "Fees", icon: <CreditCard className="h-4 w-4" />,
        content: (
          <ContentSection title="Fee Status" actions={<Button size="sm" variant="outline" onClick={() => navigate("/fees")}>Open Fees</Button>}>
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Total" value={inr(s.fees.total)} />
              <StatBox label="Paid" value={inr(s.fees.paid)} tone="success" />
              <StatBox label="Pending" value={inr(s.fees.pending)} tone="warning" />
            </div>
            <Progress value={(s.fees.paid / s.fees.total) * 100} className="mt-4 h-2" />
          </ContentSection>
        ),
      },
      {
        key: "homework", label: "Homework", icon: <BookOpen className="h-4 w-4" />,
        content: <EmptyState title="No pending homework" description="All assignments are submitted." />,
      },
      {
        key: "documents", label: "Documents", icon: <FileText className="h-4 w-4" />,
        content: (
          <ContentSection title="Documents on file">
            <ul className="divide-y divide-border">
              {["Birth Certificate", "Aadhaar Card", "Previous School TC", "Medical Certificate", "Address Proof"].map((d) => (
                <li key={d} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{d}</span></div>
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloaded ${d}`)}><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
                </li>
              ))}
            </ul>
          </ContentSection>
        ),
      },
      {
        key: "medical", label: "Medical", icon: <Heart className="h-4 w-4" />,
        content: (
          <ContentSection title="Medical Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Blood Group" value={s.bloodGroup} />
              <Field label="Allergies" value={s.medical.allergies} />
              <Field label="Conditions" value={s.medical.conditions} />
              <Field label="Doctor" value={s.medical.doctor} />
              <Field label="Doctor Phone" value={s.medical.doctorPhone} />
            </div>
          </ContentSection>
        ),
      },
      {
        key: "transport", label: "Transport", icon: <Bus className="h-4 w-4" />,
        content: (
          <ContentSection title="Transport Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Route" value={s.transport.route} />
              <Field label="Bus No." value={s.transport.busNo} />
              <Field label="Pickup Time" value={s.transport.pickup} />
              <Field label="Driver" value={s.transport.driver} />
            </div>
          </ContentSection>
        ),
      },
      {
        key: "communication", label: "Communication", icon: <MessageSquare className="h-4 w-4" />,
        content: <EmptyState title="No messages yet" description="Messages to parents will appear here." />,
      },
      {
        key: "activity", label: "Activity", icon: <History className="h-4 w-4" />,
        content: (
          <ContentSection title="Activity Timeline">
            <ActivityTimeline events={activityEvents} />
          </ContentSection>
        ),
      },
      {
        key: "audit", label: "Audit", icon: <ShieldCheck className="h-4 w-4" />,
        content: <StudentExportHistory studentId={s.id} studentName={s.name} />,
      },
    ],
    [navigate, s],
  );

  return (
    <PageLayout
      title="Student Profile"
      description={`${s.name} · ${s.admissionNo}`}
      breadcrumbs={[
        { label: "Students", href: "/students", icon: <Home className="h-3.5 w-3.5" /> },
        { label: s.name },
      ]}
    >
      <EntityProfileLayout summary={summary} actions={actions} tabs={tabs} />
    </PageLayout>
  );
}
