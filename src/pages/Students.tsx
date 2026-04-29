import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowRightLeft,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import E2EStudentDetailFixture from "@/components/teacher/E2EStudentDetailFixture";
import CombinedExportDialog from "@/components/students/CombinedExportDialog";
import { resolveEffectivePermissions } from "@/lib/userRole";
import { FileText } from "lucide-react";

// Mock student data
const studentsData = [
  {
    id: "1",
    admissionNo: "ADM2024001",
    name: "Arjun Sharma",
    class: "10",
    section: "A",
    parentName: "Rajesh Sharma",
    mobile: "+91 98765 43210",
    status: "active",
    gender: "Male",
    avatar: "",
  },
  {
    id: "2",
    admissionNo: "ADM2024002",
    name: "Priya Patel",
    class: "10",
    section: "A",
    parentName: "Vikram Patel",
    mobile: "+91 98765 43211",
    status: "active",
    gender: "Female",
    avatar: "",
  },
  {
    id: "3",
    admissionNo: "ADM2024003",
    name: "Rahul Kumar",
    class: "9",
    section: "B",
    parentName: "Suresh Kumar",
    mobile: "+91 98765 43212",
    status: "active",
    gender: "Male",
    avatar: "",
  },
  {
    id: "4",
    admissionNo: "ADM2024004",
    name: "Sneha Reddy",
    class: "8",
    section: "A",
    parentName: "Krishna Reddy",
    mobile: "+91 98765 43213",
    status: "inactive",
    gender: "Female",
    avatar: "",
  },
  {
    id: "5",
    admissionNo: "ADM2024005",
    name: "Amit Singh",
    class: "10",
    section: "B",
    parentName: "Harpreet Singh",
    mobile: "+91 98765 43214",
    status: "active",
    gender: "Male",
    avatar: "",
  },
  {
    id: "6",
    admissionNo: "ADM2024006",
    name: "Kavya Nair",
    class: "9",
    section: "A",
    parentName: "Sunil Nair",
    mobile: "+91 98765 43215",
    status: "active",
    gender: "Female",
    avatar: "",
  },
  {
    id: "7",
    admissionNo: "ADM2024007",
    name: "Rohan Gupta",
    class: "8",
    section: "B",
    parentName: "Anil Gupta",
    mobile: "+91 98765 43216",
    status: "active",
    gender: "Male",
    avatar: "",
  },
  {
    id: "8",
    admissionNo: "ADM2024008",
    name: "Ananya Verma",
    class: "7",
    section: "A",
    parentName: "Sanjay Verma",
    mobile: "+91 98765 43217",
    status: "active",
    gender: "Female",
    avatar: "",
  },
];

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];
const genders = ["Male", "Female"];

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [combinedOpen, setCombinedOpen] = useState(false);

  const perms = resolveEffectivePermissions();
  const canCombine = perms.pdf && perms.effectiveRole === "admin";

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };


  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      !selectedClass || student.class === selectedClass;
    const matchesSection =
      !selectedSection || student.section === selectedSection;
    const matchesGender =
      !selectedGender || student.gender === selectedGender;

    return matchesSearch && matchesClass && matchesSection && matchesGender;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <E2EStudentDetailFixture />
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Students</h1>
          <p className="page-description">
            Manage all student records and information
          </p>
        </div>
        <Link to="/students/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="mt-1 text-2xl font-bold text-foreground">2,847</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-success">2,798</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="mt-1 text-2xl font-bold text-muted-foreground">49</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">New This Month</p>
            <p className="mt-1 text-2xl font-bold text-primary">24</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Class filter */}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Section filter */}
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Gender filter */}
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {canCombine && selectedIds.size > 0 && (
                <Button
                  className="gap-2"
                  onClick={() => setCombinedOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  Combined PDF ({selectedIds.size})
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {canCombine && (
                  <th className="w-10">
                    <Checkbox
                      aria-label="Select all visible students"
                      checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every((s) => selectedIds.has(s.id))
                      }
                      onCheckedChange={(v) => {
                        const next = new Set(selectedIds);
                        if (v) filteredStudents.forEach((s) => next.add(s.id));
                        else filteredStudents.forEach((s) => next.delete(s.id));
                        setSelectedIds(next);
                      }}
                    />
                  </th>
                )}
                <th>Student</th>
                <th>Admission No.</th>
                <th>Class & Section</th>
                <th>Parent Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} data-state={selectedIds.has(student.id) ? "selected" : undefined}>
                  {canCombine && (
                    <td>
                      <Checkbox
                        aria-label={`Select ${student.name}`}
                        checked={selectedIds.has(student.id)}
                        onCheckedChange={(v) => toggleSelected(student.id, Boolean(v))}
                      />
                    </td>
                  )}
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{student.admissionNo}</td>
                  <td>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {student.class}-{student.section}
                    </span>
                  </td>
                  <td>{student.parentName}</td>
                  <td className="text-muted-foreground">{student.mobile}</td>
                  <td>
                    <span
                      className={
                        student.status === "active"
                          ? "badge-active"
                          : "badge-inactive"
                      }
                    >
                      {student.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/students/${student.id}`}>
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            Transfer Class
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <UserX className="h-4 w-4" />
                            Disable
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredStudents.length}</span> of{" "}
            <span className="font-medium">2,847</span> students
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              2
            </Button>
            <Button variant="outline" size="sm" className="hidden xs:flex h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              3
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
