import { useState } from "react";
import {
  Download,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const payrollData = [
  {
    id: "1",
    name: "Dr. Ramesh Kumar",
    type: "Teaching",
    employeeId: "EMP001",
    basicSalary: 65000,
    hra: 15000,
    allowances: 5000,
    deductions: 8500,
    netSalary: 76500,
    status: "paid",
  },
  {
    id: "2",
    name: "Priya Sharma",
    type: "Teaching",
    employeeId: "EMP002",
    basicSalary: 45000,
    hra: 10000,
    allowances: 3000,
    deductions: 5800,
    netSalary: 52200,
    status: "paid",
  },
  {
    id: "3",
    name: "Suresh Patel",
    type: "Teaching",
    employeeId: "EMP003",
    basicSalary: 55000,
    hra: 12000,
    allowances: 4000,
    deductions: 7100,
    netSalary: 63900,
    status: "pending",
  },
  {
    id: "4",
    name: "Ramesh Yadav",
    type: "Non-Teaching",
    employeeId: "NTS001",
    basicSalary: 25000,
    hra: 5000,
    allowances: 2000,
    deductions: 3200,
    netSalary: 28800,
    status: "paid",
  },
  {
    id: "5",
    name: "Suresh Kumar",
    type: "Non-Teaching",
    employeeId: "NTS002",
    basicSalary: 18000,
    hra: 3000,
    allowances: 1500,
    deductions: 2250,
    netSalary: 20250,
    status: "pending",
  },
  {
    id: "6",
    name: "Geeta Devi",
    type: "Non-Teaching",
    employeeId: "NTS005",
    basicSalary: 20000,
    hra: 4000,
    allowances: 2000,
    deductions: 2600,
    netSalary: 23400,
    status: "hold",
  },
  {
    id: "7",
    name: "Dr. Meena Iyer",
    type: "Teaching",
    employeeId: "EMP005",
    basicSalary: 60000,
    hra: 14000,
    allowances: 4500,
    deductions: 7800,
    netSalary: 70700,
    status: "paid",
  },
  {
    id: "8",
    name: "Rajesh Nair",
    type: "Teaching",
    employeeId: "EMP006",
    basicSalary: 48000,
    hra: 11000,
    allowances: 3500,
    deductions: 6200,
    netSalary: 56300,
    status: "paid",
  },
  {
    id: "9",
    name: "Arvind Menon",
    type: "Teaching",
    employeeId: "EMP008",
    basicSalary: 58000,
    hra: 13000,
    allowances: 4000,
    deductions: 7500,
    netSalary: 67500,
    status: "pending",
  },
  {
    id: "10",
    name: "Mohan Lal",
    type: "Non-Teaching",
    employeeId: "NTS003",
    basicSalary: 12000,
    hra: 2000,
    allowances: 1000,
    deductions: 1500,
    netSalary: 13500,
    status: "paid",
  },
  {
    id: "11",
    name: "Anita Pawar",
    type: "Non-Teaching",
    employeeId: "NTS009",
    basicSalary: 24000,
    hra: 5000,
    allowances: 2000,
    deductions: 3100,
    netSalary: 27900,
    status: "paid",
  },
  {
    id: "12",
    name: "Deepak Verma",
    type: "Non-Teaching",
    employeeId: "NTS010",
    basicSalary: 18500,
    hra: 3500,
    allowances: 1500,
    deductions: 2350,
    netSalary: 21150,
    status: "pending",
  },
];

export default function Payroll() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState("october");
  const [filterType, setFilterType] = useState("all");

  const filteredPayroll = payrollData.filter((item) => {
    if (filterType === "all") return true;
    return item.type.toLowerCase().replace("-", "") === filterType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "hold":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-active";
      case "pending":
        return "badge-pending";
      case "hold":
        return "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive";
      default:
        return "badge-inactive";
    }
  };

  const handleProcessPayroll = () => {
    toast({
      title: "Payroll Processing Started",
      description: "Salary disbursement is being processed for all pending staff.",
    });
  };

  const totalSalary = filteredPayroll.reduce((sum, item) => sum + item.netSalary, 0);
  
  const paidCount = filteredPayroll.filter((item) => item.status === "paid").length;
  const pendingCount = filteredPayroll.filter((item) => item.status === "pending").length;
  const totalStaff = filteredPayroll.length;

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-description">
            Process and manage staff salaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={handleProcessPayroll}>
            <Wallet className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCompactCurrency(totalSalary)}</p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{paidCount}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStaff}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Payroll Progress - October 2024</span>
            <span className="text-sm font-medium text-primary">
              {Math.round((paidCount / filteredPayroll.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={(paidCount / filteredPayroll.length) * 100} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{paidCount} paid</span>
            <span>{pendingCount} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search staff..." className="pl-9" />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="october">October 2024</SelectItem>
                <SelectItem value="september">September 2024</SelectItem>
                <SelectItem value="august">August 2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Staff Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="nonteaching">Non-Teaching</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-medium",
                            item.type === "Teaching"
                              ? "bg-success/10 text-success"
                              : "bg-info/10 text-info"
                          )}
                        >
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.employeeId} • {item.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{formatCurrency(item.basicSalary)}</td>
                  <td>{formatCurrency(item.hra)}</td>
                  <td className="text-success">+{formatCurrency(item.allowances)}</td>
                  <td className="text-destructive">-{formatCurrency(item.deductions)}</td>
                  <td className="font-semibold">{formatCurrency(item.netSalary)}</td>
                  <td>
                    <span className={cn("flex items-center gap-1", getStatusBadge(item.status))}>
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Payslip
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t bg-muted/30 px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPayroll.length} staff members
            </p>
            <p className="text-lg font-bold text-foreground">
              Total: {formatCurrency(totalSalary)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
