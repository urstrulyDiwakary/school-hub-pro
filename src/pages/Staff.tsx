import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  Wallet,
  Calendar,
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

const staffData = [
  {
    id: "1",
    employeeId: "NTS001",
    name: "Ramesh Yadav",
    category: "Office Staff",
    designation: "Accountant",
    mobile: "+91 98765 43210",
    status: "active",
    salary: 25000,
    joinDate: "2020-04-15",
  },
  {
    id: "2",
    employeeId: "NTS002",
    name: "Suresh Kumar",
    category: "Driver",
    designation: "Bus Driver",
    mobile: "+91 98765 43211",
    status: "active",
    salary: 18000,
    joinDate: "2019-06-01",
  },
  {
    id: "3",
    employeeId: "NTS003",
    name: "Mohan Lal",
    category: "Helper",
    designation: "Peon",
    mobile: "+91 98765 43212",
    status: "active",
    salary: 12000,
    joinDate: "2018-03-20",
  },
  {
    id: "4",
    employeeId: "NTS004",
    name: "Raju Singh",
    category: "Watchman",
    designation: "Security Guard",
    mobile: "+91 98765 43213",
    status: "active",
    salary: 15000,
    joinDate: "2021-01-10",
  },
  {
    id: "5",
    employeeId: "NTS005",
    name: "Geeta Devi",
    category: "Office Staff",
    designation: "Receptionist",
    mobile: "+91 98765 43214",
    status: "active",
    salary: 20000,
    joinDate: "2022-07-15",
  },
  {
    id: "6",
    employeeId: "NTS006",
    name: "Prakash Sharma",
    category: "Driver",
    designation: "Van Driver",
    mobile: "+91 98765 43215",
    status: "inactive",
    salary: 16000,
    joinDate: "2017-09-01",
  },
  {
    id: "7",
    employeeId: "NTS007",
    name: "Lakshmi Bai",
    category: "Helper",
    designation: "Sweeper",
    mobile: "+91 98765 43216",
    status: "active",
    salary: 10000,
    joinDate: "2019-11-20",
  },
  {
    id: "8",
    employeeId: "NTS008",
    name: "Vijay Kumar",
    category: "Office Staff",
    designation: "Lab Assistant",
    mobile: "+91 98765 43217",
    status: "active",
    salary: 22000,
    joinDate: "2020-08-05",
  },
];

const categories = ["Office Staff", "Driver", "Helper", "Watchman"];

export default function Staff() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Office Staff":
        return "bg-primary/10 text-primary";
      case "Driver":
        return "bg-success/10 text-success";
      case "Helper":
        return "bg-warning/10 text-warning";
      case "Watchman":
        return "bg-info/10 text-info";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Non-Teaching Staff</h1>
          <p className="page-description">
            Manage non-teaching staff records
          </p>
        </div>
        <Link to="/staff/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">85</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Wallet className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹12.5L</p>
                <p className="text-sm text-muted-foreground">Monthly Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search staff..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
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

      {/* Staff Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Employee ID</th>
                <th>Category</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-info/10 text-info text-xs font-medium">
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {staff.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {staff.mobile}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{staff.employeeId}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${getCategoryColor(
                        staff.category
                      )}`}
                    >
                      {staff.category}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{staff.designation}</td>
                  <td className="font-medium">{formatCurrency(staff.salary)}</td>
                  <td>
                    <span
                      className={
                        staff.status === "active"
                          ? "badge-active"
                          : "badge-inactive"
                      }
                    >
                      {staff.status === "active" ? "Active" : "Inactive"}
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
