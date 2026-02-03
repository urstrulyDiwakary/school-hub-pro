import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teachersData = [
  {
    id: "1",
    employeeId: "EMP001",
    name: "Dr. Ramesh Kumar",
    subjects: ["Mathematics", "Physics"],
    classes: ["10-A", "10-B", "11-A"],
    qualification: "Ph.D Mathematics",
    experience: "15 years",
    status: "active",
    email: "ramesh.kumar@school.edu",
    mobile: "+91 98765 43210",
  },
  {
    id: "2",
    employeeId: "EMP002",
    name: "Priya Sharma",
    subjects: ["English", "Literature"],
    classes: ["8-A", "8-B", "9-A"],
    qualification: "M.A English",
    experience: "8 years",
    status: "active",
    email: "priya.sharma@school.edu",
    mobile: "+91 98765 43211",
  },
  {
    id: "3",
    employeeId: "EMP003",
    name: "Suresh Patel",
    subjects: ["Science", "Biology"],
    classes: ["6-A", "6-B", "7-A"],
    qualification: "M.Sc Biology",
    experience: "10 years",
    status: "active",
    email: "suresh.patel@school.edu",
    mobile: "+91 98765 43212",
  },
  {
    id: "4",
    employeeId: "EMP004",
    name: "Anita Reddy",
    subjects: ["Hindi"],
    classes: ["5-A", "5-B", "6-A"],
    qualification: "M.A Hindi",
    experience: "6 years",
    status: "inactive",
    email: "anita.reddy@school.edu",
    mobile: "+91 98765 43213",
  },
];

export default function Teachers() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Teachers</h1>
          <p className="page-description">
            Manage teaching staff records and assignments
          </p>
        </div>
        <Link to="/teachers/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Teachers</p>
            <p className="mt-1 text-2xl font-bold text-foreground">156</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-success">152</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">On Leave</p>
            <p className="mt-1 text-2xl font-bold text-warning">4</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Class Teachers</p>
            <p className="mt-1 text-2xl font-bold text-primary">48</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Employee ID</th>
                <th>Subjects</th>
                <th>Classes</th>
                <th>Experience</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachersData.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-success/10 text-success text-xs font-medium">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {teacher.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{teacher.employeeId}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.slice(0, 2).map((cls) => (
                        <span
                          key={cls}
                          className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {cls}
                        </span>
                      ))}
                      {teacher.classes.length > 2 && (
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          +{teacher.classes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground">{teacher.experience}</td>
                  <td>
                    <span
                      className={
                        teacher.status === "active"
                          ? "badge-active"
                          : "badge-inactive"
                      }
                    >
                      {teacher.status === "active" ? "Active" : "Inactive"}
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
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Remove
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
      </Card>
    </div>
  );
}
