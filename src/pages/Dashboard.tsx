import {
  Users,
  GraduationCap,
  UserCheck,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statsCards = [
  {
    title: "Total Students",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Teaching Staff",
    value: "156",
    change: "+3%",
    trend: "up",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Non-Teaching Staff",
    value: "89",
    change: "0%",
    trend: "neutral",
    icon: UserCheck,
    color: "bg-info/10 text-info",
  },
  {
    title: "Today's Attendance",
    value: "94.2%",
    change: "-0.8%",
    trend: "down",
    icon: Calendar,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Fee Collection (Month)",
    value: "₹18.5L",
    change: "+8%",
    trend: "up",
    icon: CreditCard,
    color: "bg-success/10 text-success",
  },
  {
    title: "Salary Expense (Month)",
    value: "₹12.3L",
    change: "+2%",
    trend: "up",
    icon: Wallet,
    color: "bg-destructive/10 text-destructive",
  },
];

const feeCollectionData = [
  { month: "Apr", collected: 15.2, pending: 4.8 },
  { month: "May", collected: 16.8, pending: 3.2 },
  { month: "Jun", collected: 14.5, pending: 5.5 },
  { month: "Jul", collected: 18.2, pending: 2.8 },
  { month: "Aug", collected: 17.9, pending: 3.1 },
  { month: "Sep", collected: 19.5, pending: 2.5 },
  { month: "Oct", collected: 18.5, pending: 3.5 },
];

const studentsByClass = [
  { class: "Class 1", students: 180 },
  { class: "Class 2", students: 195 },
  { class: "Class 3", students: 210 },
  { class: "Class 4", students: 225 },
  { class: "Class 5", students: 240 },
  { class: "Class 6", students: 255 },
  { class: "Class 7", students: 268 },
  { class: "Class 8", students: 285 },
  { class: "Class 9", students: 310 },
  { class: "Class 10", students: 320 },
  { class: "Class 11", students: 180 },
  { class: "Class 12", students: 179 },
];

const attendanceTrend = [
  { day: "Mon", students: 96.2, staff: 98.5 },
  { day: "Tue", students: 95.8, staff: 97.2 },
  { day: "Wed", students: 94.5, staff: 96.8 },
  { day: "Thu", students: 93.2, staff: 95.5 },
  { day: "Fri", students: 91.8, staff: 94.2 },
  { day: "Sat", students: 88.5, staff: 92.1 },
];

const genderDistribution = [
  { name: "Boys", value: 1524, color: "hsl(234, 89%, 54%)" },
  { name: "Girls", value: 1323, color: "hsl(340, 82%, 52%)" },
];

const recentActivities = [
  {
    type: "admission",
    title: "New Admission",
    description: "Arjun Kumar enrolled in Class 6-A",
    time: "10 mins ago",
  },
  {
    type: "fee",
    title: "Fee Payment",
    description: "Sneha Patel paid ₹25,000 - Class 8-B",
    time: "25 mins ago",
  },
  {
    type: "attendance",
    title: "Attendance Alert",
    description: "Class 9-C has low attendance today (82%)",
    time: "1 hour ago",
  },
  {
    type: "staff",
    title: "Leave Approved",
    description: "Mr. Rajesh Kumar - 2 days sick leave",
    time: "2 hours ago",
  },
  {
    type: "exam",
    title: "Exam Scheduled",
    description: "Mid-term exams scheduled for Nov 15-25",
    time: "3 hours ago",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome back! Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="stat-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`stat-card-icon ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-success"
                      : stat.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Collection Chart */}
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Fee Collection Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feeCollectionData}>
                  <defs>
                    <linearGradient
                      id="colorCollected"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(160, 84%, 39%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(160, 84%, 39%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 13%, 91%)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    tickFormatter={(value) => `₹${value}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px hsl(220 20% 10% / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value}L`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="hsl(160, 84%, 39%)"
                    strokeWidth={2}
                    fill="url(#colorCollected)"
                    name="Collected"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    fill="hsl(38, 92%, 50%)"
                    fillOpacity={0.1}
                    name="Pending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Students by Class */}
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Students by Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByClass}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 13%, 91%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="class"
                    tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px hsl(220 20% 10% / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="students"
                    fill="hsl(234, 89%, 54%)"
                    radius={[4, 4, 0, 0]}
                    name="Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance Trend */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Weekly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(234, 89%, 54%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(234, 89%, 54%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorStaff"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(160, 84%, 39%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(160, 84%, 39%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 13%, 91%)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                  />
                  <YAxis
                    domain={[85, 100]}
                    tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px hsl(220 20% 10% / 0.1)",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(234, 89%, 54%)"
                    strokeWidth={2}
                    fill="url(#colorStudents)"
                    name="Students"
                  />
                  <Area
                    type="monotone"
                    dataKey="staff"
                    stroke="hsl(160, 84%, 39%)"
                    strokeWidth={2}
                    fill="url(#colorStaff)"
                    name="Staff"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Staff</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution & Recent Activity */}
        <div className="space-y-6">
          {/* Gender Distribution */}
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {genderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px hsl(220 20% 10% / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                {genderDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivities.slice(0, 4).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
