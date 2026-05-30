import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  CreditCard,
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
import { Progress } from "@/components/ui/progress";

const feeData = [
  {
    id: "1",
    studentName: "Arjun Sharma",
    class: "10-A",
    admissionNo: "ADM2024001",
    totalFee: 85000,
    paid: 65000,
    pending: 20000,
    lastPayment: "2024-10-15",
    status: "partial",
  },
  {
    id: "2",
    studentName: "Priya Patel",
    class: "10-A",
    admissionNo: "ADM2024002",
    totalFee: 85000,
    paid: 85000,
    pending: 0,
    lastPayment: "2024-09-05",
    status: "paid",
  },
  {
    id: "3",
    studentName: "Rahul Kumar",
    class: "9-B",
    admissionNo: "ADM2024003",
    totalFee: 75000,
    paid: 0,
    pending: 75000,
    lastPayment: "-",
    status: "unpaid",
  },
  {
    id: "4",
    studentName: "Sneha Reddy",
    class: "8-A",
    admissionNo: "ADM2024004",
    totalFee: 70000,
    paid: 35000,
    pending: 35000,
    lastPayment: "2024-08-20",
    status: "partial",
  },
  {
    id: "5",
    studentName: "Amit Singh",
    class: "10-B",
    admissionNo: "ADM2024005",
    totalFee: 85000,
    paid: 85000,
    pending: 0,
    lastPayment: "2024-09-12",
    status: "paid",
  },
  {
    id: "6",
    studentName: "Kavya Nair",
    class: "9-A",
    admissionNo: "ADM2024006",
    totalFee: 75000,
    paid: 50000,
    pending: 25000,
    lastPayment: "2024-10-02",
    status: "partial",
  },
  {
    id: "7",
    studentName: "Rohan Gupta",
    class: "8-B",
    admissionNo: "ADM2024007",
    totalFee: 70000,
    paid: 70000,
    pending: 0,
    lastPayment: "2024-08-28",
    status: "paid",
  },
  {
    id: "8",
    studentName: "Ananya Verma",
    class: "7-A",
    admissionNo: "ADM2024008",
    totalFee: 65000,
    paid: 0,
    pending: 65000,
    lastPayment: "-",
    status: "unpaid",
  },
  {
    id: "9",
    studentName: "Vikram Reddy",
    class: "10-A",
    admissionNo: "ADM2024009",
    totalFee: 85000,
    paid: 60000,
    pending: 25000,
    lastPayment: "2024-10-18",
    status: "partial",
  },
  {
    id: "10",
    studentName: "Meera Iyer",
    class: "9-A",
    admissionNo: "ADM2024010",
    totalFee: 75000,
    paid: 75000,
    pending: 0,
    lastPayment: "2024-09-20",
    status: "paid",
  },
  {
    id: "11",
    studentName: "Aditya Joshi",
    class: "11-B",
    admissionNo: "ADM2024011",
    totalFee: 95000,
    paid: 45000,
    pending: 50000,
    lastPayment: "2024-10-10",
    status: "partial",
  },
  {
    id: "12",
    studentName: "Shreya Das",
    class: "12-A",
    admissionNo: "ADM2024012",
    totalFee: 98000,
    paid: 98000,
    pending: 0,
    lastPayment: "2024-09-08",
    status: "paid",
  },
];

export default function Fees() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-active";
      case "partial":
        return "badge-pending";
      case "unpaid":
        return "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive";
      default:
        return "badge-inactive";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Fee Management</h1>
          <p className="page-description">
            Track and manage student fee payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <CreditCard className="h-4 w-4" />
            Collect Fee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Collection</p>
            <p className="mt-1 text-2xl font-bold text-foreground">₹18.5L</p>
            <p className="mt-1 text-xs text-success">This month</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="mt-1 text-2xl font-bold text-warning">₹4.2L</p>
            <p className="mt-1 text-xs text-muted-foreground">From 245 students</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Collection Rate</p>
            <p className="mt-1 text-2xl font-bold text-success">81.5%</p>
            <Progress value={81.5} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today's Collection</p>
            <p className="mt-1 text-2xl font-bold text-primary">₹85,000</p>
            <p className="mt-1 text-xs text-muted-foreground">12 payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or admission no..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
                <SelectItem value="8">Class 8</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fee Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No.</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Last Payment</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeData.map((fee) => (
                <tr key={fee.id}>
                  <td>
                    <div>
                      <p className="font-medium text-foreground">
                        {fee.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fee.class}
                      </p>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{fee.admissionNo}</td>
                  <td className="font-medium">{formatCurrency(fee.totalFee)}</td>
                  <td className="text-success">{formatCurrency(fee.paid)}</td>
                  <td className="text-destructive">
                    {formatCurrency(fee.pending)}
                  </td>
                  <td className="text-muted-foreground">{fee.lastPayment}</td>
                  <td>
                    <span className={getStatusBadge(fee.status)}>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
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
                            <CreditCard className="h-4 w-4" />
                            Collect Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Receipt
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
