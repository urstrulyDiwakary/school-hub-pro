import {
  Download,
  FileText,
  Users,
  GraduationCap,
  CreditCard,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Apr", students: 2650, fees: 15.2, attendance: 94.5 },
  { month: "May", students: 2680, fees: 16.8, attendance: 93.2 },
  { month: "Jun", students: 2720, fees: 14.5, attendance: 91.8 },
  { month: "Jul", students: 2780, fees: 18.2, attendance: 95.1 },
  { month: "Aug", students: 2810, fees: 17.9, attendance: 94.8 },
  { month: "Sep", students: 2835, fees: 19.5, attendance: 93.5 },
  { month: "Oct", students: 2847, fees: 18.5, attendance: 94.2 },
];

const classWiseStrength = [
  { class: "Class 1", boys: 95, girls: 85 },
  { class: "Class 2", boys: 102, girls: 93 },
  { class: "Class 3", boys: 110, girls: 100 },
  { class: "Class 4", boys: 118, girls: 107 },
  { class: "Class 5", boys: 125, girls: 115 },
  { class: "Class 6", boys: 132, girls: 123 },
  { class: "Class 7", boys: 140, girls: 128 },
  { class: "Class 8", boys: 148, girls: 137 },
  { class: "Class 9", boys: 160, girls: 150 },
  { class: "Class 10", boys: 168, girls: 152 },
  { class: "Class 11", boys: 95, girls: 85 },
  { class: "Class 12", boys: 92, girls: 87 },
];

const feeCollectionByCategory = [
  { name: "Tuition Fee", value: 45, color: "hsl(234, 89%, 54%)" },
  { name: "Bus Fee", value: 20, color: "hsl(160, 84%, 39%)" },
  { name: "Exam Fee", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Lab Fee", value: 12, color: "hsl(199, 89%, 48%)" },
  { name: "Library Fee", value: 8, color: "hsl(280, 68%, 60%)" },
];

const attendanceByClass = [
  { class: "Class 10", percentage: 96.5 },
  { class: "Class 9", percentage: 95.2 },
  { class: "Class 8", percentage: 94.8 },
  { class: "Class 7", percentage: 93.5 },
  { class: "Class 6", percentage: 92.1 },
  { class: "Class 5", percentage: 91.8 },
];

const reportTypes = [
  {
    title: "Student Strength Report",
    description: "Class-wise and section-wise student count",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Fee Collection Report",
    description: "Daily, monthly, and yearly collection summary",
    icon: CreditCard,
    color: "bg-success/10 text-success",
  },
  {
    title: "Attendance Report",
    description: "Student and staff attendance analysis",
    icon: Calendar,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Staff Report",
    description: "Teaching and non-teaching staff details",
    icon: Users,
    color: "bg-info/10 text-info",
  },
  {
    title: "Academic Performance",
    description: "Exam results and grade distribution",
    icon: TrendingUp,
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    title: "Salary Expense Report",
    description: "Monthly payroll and expense breakdown",
    icon: FileText,
    color: "bg-destructive/10 text-destructive",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-description">
            Comprehensive insights and data analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024-25">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2022-23">2022-23</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick Reports Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title} className="stat-card group cursor-pointer">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className={`stat-card-icon flex-shrink-0 ${report.color}`}>
                  <report.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{report.title}</h3>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
              </div>
              <div className="mt-3 sm:mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9">
                  View
                </Button>
                <Button size="sm" className="flex-1 gap-1 text-xs sm:text-sm h-8 sm:h-9">
                  <Download className="h-3 w-3" />
                  <span className="hidden xs:inline">Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Student Growth Trend */}
        <Card className="stat-card">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="hidden xs:inline">Student Growth Trend</span>
                <span className="xs:hidden">Growth Trend</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} domain={[2600, 2900]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(234, 89%, 54%)"
                    strokeWidth={2}
                    fill="url(#colorStudents)"
                    name="Total Students"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection by Category */}
        <Card className="stat-card">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                <span className="hidden xs:inline">Fee Collection by Category</span>
                <span className="xs:hidden">Fee Category</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={feeCollectionByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                    labelLine={false}
                  >
                    {feeCollectionByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Strength */}
      <Card className="stat-card">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              <span className="hidden xs:inline">Class-wise Student Strength</span>
              <span className="xs:hidden">Student Strength</span>
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[250px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classWiseStrength}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis
                  dataKey="class"
                  tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 91%)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="boys" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} name="Boys" />
                <Bar dataKey="girls" fill="hsl(340, 82%, 52%)" radius={[4, 4, 0, 0]} name="Girls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Attendance by Class */}
      <Card className="stat-card">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            <span className="hidden xs:inline">Attendance Performance by Class</span>
            <span className="xs:hidden">Attendance by Class</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {attendanceByClass.map((item, index) => (
              <div key={item.class} className="flex items-center gap-2 sm:gap-4">
                <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-foreground">{item.class}</div>
                <div className="flex-1">
                  <div className="h-2 sm:h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 sm:w-16 text-right text-xs sm:text-sm font-semibold text-foreground">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
