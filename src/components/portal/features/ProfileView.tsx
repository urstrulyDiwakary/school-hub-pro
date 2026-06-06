import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Droplet, CreditCard, GraduationCap } from "lucide-react";
import type { Student } from "@/data/portal/students";

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ProfileView({ student }: { student: Student }) {
  const a = student.academic;
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
            <p className="text-sm text-muted-foreground">
              {a.className} - {a.section} · Roll No. {a.rollNo}
            </p>
            <p className="text-xs text-muted-foreground">Admission No. {a.admissionNo}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <Row icon={User} label="Gender" value={student.gender} />
            <Row icon={User} label="Date of Birth" value={new Date(student.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />
            <Row icon={Droplet} label="Blood Group" value={student.bloodGroup} />
            <Row icon={CreditCard} label="Aadhaar" value={student.aadhaar} />
            <Row icon={Phone} label="Phone" value={student.phone} />
            <Row icon={Mail} label="Email" value={student.email} />
            <Row icon={MapPin} label="Address" value={student.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <Row icon={GraduationCap} label="Class & Section" value={`${a.className} - ${a.section}`} />
            <Row icon={GraduationCap} label="Class Teacher" value={a.classTeacher} />
            <Row icon={GraduationCap} label="House" value={a.house} />
            <Row icon={GraduationCap} label="Academic Year" value={a.academicYear} />
            <Row icon={GraduationCap} label="Roll Number" value={String(a.rollNo)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {student.emergencyContacts.map((c) => (
            <div key={c.phone} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.relation}</p>
              <p className="mt-1 flex items-center gap-1 text-sm"><Phone className="h-3.5 w-3.5" /> {c.phone}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
