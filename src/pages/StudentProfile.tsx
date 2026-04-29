import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Download,
  Eye,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Receipt,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Mock student data
const studentData = {
  id: "1",
  admissionNo: "ADM2024001",
  name: "Arjun Sharma",
  class: "10",
  section: "A",
  rollNo: "15",
  gender: "Male",
  dob: "2009-05-15",
  bloodGroup: "B+",
  aadhaar: "XXXX-XXXX-4521",
  email: "arjun.sharma@email.com",
  phone: "+91 98765 43210",
  address: "123, Green Valley Apartments, Sector 12, Gurugram, Haryana - 122001",
  avatar: "",
  status: "active",
  academicYear: "2024-25",
  admissionDate: "2020-04-15",
  parent: {
    fatherName: "Rajesh Sharma",
    motherName: "Sunita Sharma",
    fatherPhone: "+91 98765 43210",
    motherPhone: "+91 98765 43211",
    fatherOccupation: "Business",
    motherOccupation: "Teacher",
    email: "rajesh.sharma@email.com",
  },
  medical: {
    allergies: "None",
    conditions: "None",
    emergencyContact: "+91 98765 43210",
  },
};

const attendanceData = {
  summary: {
    totalDays: 180,
    present: 165,
    absent: 10,
    late: 5,
    percentage: 91.7,
  },
  monthly: [
    { month: "Apr", present: 22, absent: 2, total: 24 },
    { month: "May", present: 20, absent: 1, total: 21 },
    { month: "Jun", present: 18, absent: 2, total: 20 },
    { month: "Jul", present: 23, absent: 1, total: 24 },
    { month: "Aug", present: 21, absent: 2, total: 23 },
    { month: "Sep", present: 20, absent: 1, total: 21 },
    { month: "Oct", present: 22, absent: 0, total: 22 },
    { month: "Nov", present: 19, absent: 1, total: 20 },
  ],
  recent: [
    { date: "2024-11-15", status: "present" },
    { date: "2024-11-14", status: "present" },
    { date: "2024-11-13", status: "late" },
    { date: "2024-11-12", status: "present" },
    { date: "2024-11-11", status: "absent" },
    { date: "2024-11-08", status: "present" },
    { date: "2024-11-07", status: "present" },
    { date: "2024-11-06", status: "present" },
  ],
};

const marksData = {
  exams: [
    {
      name: "First Term",
      date: "Aug 2024",
      subjects: [
        { name: "Mathematics", marks: 85, total: 100, grade: "A" },
        { name: "Science", marks: 78, total: 100, grade: "B+" },
        { name: "English", marks: 82, total: 100, grade: "A" },
        { name: "Hindi", marks: 75, total: 100, grade: "B+" },
        { name: "Social Science", marks: 80, total: 100, grade: "A" },
      ],
      totalMarks: 400,
      obtainedMarks: 400,
      percentage: 80,
      rank: 5,
    },
    {
      name: "Mid Term",
      date: "Oct 2024",
      subjects: [
        { name: "Mathematics", marks: 88, total: 100, grade: "A+" },
        { name: "Science", marks: 82, total: 100, grade: "A" },
        { name: "English", marks: 85, total: 100, grade: "A" },
        { name: "Hindi", marks: 78, total: 100, grade: "B+" },
        { name: "Social Science", marks: 84, total: 100, grade: "A" },
      ],
      totalMarks: 500,
      obtainedMarks: 417,
      percentage: 83.4,
      rank: 3,
    },
  ],
  overallGrade: "A",
  overallPercentage: 81.7,
  classRank: 4,
};

const documentsData = [
  { id: "1", name: "Birth Certificate", type: "PDF", size: "245 KB", uploadedOn: "2020-04-15", status: "verified" },
  { id: "2", name: "Aadhaar Card", type: "PDF", size: "180 KB", uploadedOn: "2020-04-15", status: "verified" },
  { id: "3", name: "Previous School TC", type: "PDF", size: "320 KB", uploadedOn: "2020-04-15", status: "verified" },
  { id: "4", name: "Medical Certificate", type: "PDF", size: "150 KB", uploadedOn: "2024-06-10", status: "pending" },
  { id: "5", name: "Address Proof", type: "PDF", size: "210 KB", uploadedOn: "2020-04-15", status: "verified" },
];

const feesData = {
  summary: {
    totalFee: 85000,
    paid: 65000,
    pending: 20000,
    discount: 5000,
    dueDate: "2024-12-31",
  },
  feeBreakdown: [
    { category: "Tuition Fee", amount: 45000, paid: 45000, status: "paid" },
    { category: "Admission Fee", amount: 15000, paid: 15000, status: "paid" },
    { category: "Lab Fee", amount: 8000, paid: 5000, status: "partial" },
    { category: "Library Fee", amount: 5000, paid: 0, status: "unpaid" },
    { category: "Sports Fee", amount: 7000, paid: 0, status: "unpaid" },
    { category: "Computer Fee", amount: 5000, paid: 0, status: "unpaid" },
  ],
  paymentHistory: [
    { id: "PAY001", date: "2024-04-15", amount: 30000, mode: "Online", reference: "TXN2024041500123", status: "success" },
    { id: "PAY002", date: "2024-07-20", amount: 20000, mode: "Cheque", reference: "CHQ123456", status: "success" },
    { id: "PAY003", date: "2024-10-05", amount: 15000, mode: "Cash", reference: "RCP2024100500456", status: "success" },
  ],
};

const remarksData = {
  summary: {
    totalRemarks: 12,
    academic: 7,
    behavioral: 5,
    positive: 9,
    negative: 3,
  },
  remarks: [
    {
      id: "1",
      type: "academic",
      sentiment: "positive",
      subject: "Mathematics",
      teacher: "Dr. Ramesh Kumar",
      date: "2024-11-10",
      title: "Excellent problem-solving skills",
      description: "Arjun has shown remarkable improvement in solving complex algebraic equations. He actively participates in class discussions and helps fellow students understand difficult concepts.",
    },
    {
      id: "2",
      type: "behavioral",
      sentiment: "positive",
      subject: null,
      teacher: "Mrs. Priya Sharma",
      date: "2024-11-05",
      title: "Leadership qualities",
      description: "Demonstrated excellent leadership during the group project. Coordinated well with team members and ensured everyone contributed equally.",
    },
    {
      id: "3",
      type: "academic",
      sentiment: "negative",
      subject: "English",
      teacher: "Mr. Suresh Patel",
      date: "2024-10-28",
      title: "Needs improvement in essay writing",
      description: "Essays lack proper structure and coherence. Recommended to practice more creative writing and focus on grammar rules.",
    },
    {
      id: "4",
      type: "behavioral",
      sentiment: "positive",
      subject: null,
      teacher: "Mrs. Anita Verma",
      date: "2024-10-20",
      title: "Helpful and respectful",
      description: "Always willing to help classmates and shows respect towards teachers and staff. Sets a good example for others.",
    },
    {
      id: "5",
      type: "academic",
      sentiment: "positive",
      subject: "Science",
      teacher: "Dr. Kavita Singh",
      date: "2024-10-15",
      title: "Outstanding lab performance",
      description: "Conducted all experiments with precision and maintained excellent lab notes. Shows genuine interest in scientific research.",
    },
    {
      id: "6",
      type: "behavioral",
      sentiment: "negative",
      subject: null,
      teacher: "Mr. Vikram Rao",
      date: "2024-09-25",
      title: "Occasional tardiness",
      description: "Has been late to morning assembly a few times. Needs to improve punctuality.",
    },
  ],
};

export default function StudentProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-success bg-success/10";
      case "absent":
        return "text-destructive bg-destructive/10";
      case "late":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-success/10 text-success border-success/20";
    if (grade.startsWith("B")) return "bg-primary/10 text-primary border-primary/20";
    if (grade.startsWith("C")) return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/students">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Student Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View and manage student information
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-11 sm:ml-0">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
          <Button size="sm">Print ID Card</Button>
        </div>
      </div>

      {/* Student Header Card */}
      <Card className="stat-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg mx-auto sm:mx-0">
              <AvatarImage src={studentData.avatar} alt={studentData.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
                {getInitials(studentData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{studentData.name}</h2>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 w-fit mx-auto sm:mx-0">
                  Active
                </Badge>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  Class {studentData.class}-{studentData.section}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Roll No: {studentData.rollNo}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {studentData.admissionNo}
                </span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {studentData.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {studentData.email}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-0">
              <div className="text-center p-2 sm:p-3 bg-background rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-primary">{attendanceData.summary.percentage}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Attendance</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-background rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-success">{marksData.overallPercentage}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Marks</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-background rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-warning">#{marksData.classRank}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Class Rank</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-10 sm:h-11">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="marks" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Marks
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Fees
            </TabsTrigger>
            <TabsTrigger value="remarks" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Remarks
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4">
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="stat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(studentData.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{studentData.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{studentData.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aadhaar</p>
                    <p className="font-medium font-mono">{studentData.aadhaar}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{studentData.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="stat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Class & Section</p>
                    <p className="font-medium">Class {studentData.class}-{studentData.section}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{studentData.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Admission No.</p>
                    <p className="font-medium font-mono">{studentData.admissionNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Year</p>
                    <p className="font-medium">{studentData.academicYear}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Admission Date</p>
                    <p className="font-medium">{new Date(studentData.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card className="stat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Father</p>
                  <p className="font-medium">{studentData.parent.fatherName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {studentData.parent.fatherPhone}
                    </span>
                    <span>{studentData.parent.fatherOccupation}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Mother</p>
                  <p className="font-medium">{studentData.parent.motherName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {studentData.parent.motherPhone}
                    </span>
                    <span>{studentData.parent.motherOccupation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="stat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Allergies</p>
                    <p className="font-medium">{studentData.medical.allergies}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Health Conditions</p>
                    <p className="font-medium">{studentData.medical.conditions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{studentData.medical.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Days</p>
                    <p className="text-lg sm:text-xl font-bold">{attendanceData.summary.totalDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Present</p>
                    <p className="text-lg sm:text-xl font-bold text-success">{attendanceData.summary.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Absent</p>
                    <p className="text-lg sm:text-xl font-bold text-destructive">{attendanceData.summary.absent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Late</p>
                    <p className="text-lg sm:text-xl font-bold text-warning">{attendanceData.summary.late}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Percentage */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-bold text-primary">{attendanceData.summary.percentage}%</span>
                </div>
                <Progress value={attendanceData.summary.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 min-w-[320px]">
                  {attendanceData.monthly.map((month) => (
                    <div key={month.month} className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{month.month}</p>
                      <p className="text-base sm:text-lg font-bold text-success">{month.present}</p>
                      <p className="text-[10px] text-muted-foreground">/{month.total}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {attendanceData.recent.map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <div className={`p-1.5 sm:p-2 rounded-lg ${getStatusColor(day.status)}`}>
                      {day.status === "present" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />}
                      {day.status === "absent" && <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />}
                      {day.status === "late" && <Clock className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <StudentExportHistory studentId={studentData.admissionNo} studentName={studentData.name} />
        </TabsContent>

        {/* Marks Tab */}
        <TabsContent value="marks" className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4 text-center">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Overall Grade</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{marksData.overallGrade}</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4 text-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-success mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Percentage</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{marksData.overallPercentage}%</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4 text-center">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-warning mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Class Rank</p>
                <p className="text-xl sm:text-2xl font-bold text-warning">#{marksData.classRank}</p>
              </CardContent>
            </Card>
          </div>

          {/* Exam Results */}
          {marksData.exams.map((exam, examIndex) => (
            <Card key={examIndex} className="stat-card">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">{exam.name} Examination</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{exam.date}</Badge>
                    <Badge className={getGradeColor("A")}>Rank #{exam.rank}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th className="text-center">Marks</th>
                        <th className="text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.subjects.map((subject, subIndex) => (
                        <tr key={subIndex}>
                          <td className="font-medium">{subject.name}</td>
                          <td className="text-center">
                            <span className="font-semibold">{subject.marks}</span>
                            <span className="text-muted-foreground">/{subject.total}</span>
                          </td>
                          <td className="text-center">
                            <Badge variant="outline" className={getGradeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-semibold">
                        <td>Total</td>
                        <td className="text-center">
                          {exam.obtainedMarks}/{exam.totalMarks} ({exam.percentage}%)
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-4 sm:space-y-6">
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Fee</p>
                    <p className="text-lg sm:text-xl font-bold">₹{feesData.summary.totalFee.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-lg sm:text-xl font-bold text-success">₹{feesData.summary.paid.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-lg sm:text-xl font-bold text-destructive">₹{feesData.summary.pending.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm sm:text-base font-bold text-warning">
                      {new Date(feesData.summary.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Progress */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">Payment Progress</CardTitle>
                <Button size="sm" className="w-full sm:w-auto gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{feesData.summary.paid.toLocaleString("en-IN")} of ₹{feesData.summary.totalFee.toLocaleString("en-IN")}
                  </span>
                  <span className="font-bold text-primary">
                    {Math.round((feesData.summary.paid / feesData.summary.totalFee) * 100)}%
                  </span>
                </div>
                <Progress value={(feesData.summary.paid / feesData.summary.totalFee) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Paid</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData.feeBreakdown.map((fee, index) => (
                      <tr key={index}>
                        <td className="font-medium">{fee.category}</td>
                        <td className="text-right">₹{fee.amount.toLocaleString("en-IN")}</td>
                        <td className="text-right text-success">₹{fee.paid.toLocaleString("en-IN")}</td>
                        <td className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              fee.status === "paid"
                                ? "bg-success/10 text-success border-success/20"
                                : fee.status === "partial"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-semibold">
                      <td>Total</td>
                      <td className="text-right">₹{feesData.summary.totalFee.toLocaleString("en-IN")}</td>
                      <td className="text-right text-success">₹{feesData.summary.paid.toLocaleString("en-IN")}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feesData.paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/10">
                        <Receipt className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">₹{payment.amount.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.mode} • {payment.reference}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-11 sm:ml-0">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(payment.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Success
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remarks Tab */}
        <TabsContent value="remarks" className="space-y-4 sm:space-y-6">
          {/* Remarks Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Remarks</p>
                    <p className="text-lg sm:text-xl font-bold">{remarksData.summary.totalRemarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Positive</p>
                    <p className="text-lg sm:text-xl font-bold text-success">{remarksData.summary.positive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Needs Work</p>
                    <p className="text-lg sm:text-xl font-bold text-destructive">{remarksData.summary.negative}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Academic</p>
                    <p className="text-lg sm:text-xl font-bold text-warning">{remarksData.summary.academic}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Remarks */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Academic Remarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {remarksData.remarks
                  .filter((r) => r.type === "academic")
                  .map((remark) => (
                    <div
                      key={remark.id}
                      className={`p-3 sm:p-4 border rounded-lg ${
                        remark.sentiment === "positive"
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {remark.sentiment === "positive" ? (
                            <ThumbsUp className="h-4 w-4 text-success" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-destructive" />
                          )}
                          <h4 className="font-medium text-sm">{remark.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 ml-6 sm:ml-0">
                          {remark.subject && (
                            <Badge variant="outline" className="text-xs">
                              {remark.subject}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(remark.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{remark.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">— {remark.teacher}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Behavioral Remarks */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Behavioral Remarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {remarksData.remarks
                  .filter((r) => r.type === "behavioral")
                  .map((remark) => (
                    <div
                      key={remark.id}
                      className={`p-3 sm:p-4 border rounded-lg ${
                        remark.sentiment === "positive"
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {remark.sentiment === "positive" ? (
                            <ThumbsUp className="h-4 w-4 text-success" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-destructive" />
                          )}
                          <h4 className="font-medium text-sm">{remark.title}</h4>
                        </div>
                        <span className="text-xs text-muted-foreground ml-6 sm:ml-0">
                          {new Date(remark.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{remark.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">— {remark.teacher}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">Uploaded Documents</CardTitle>
                <Button size="sm" className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentsData.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • Uploaded on {new Date(doc.uploadedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-11 sm:ml-0">
                      <Badge
                        variant="outline"
                        className={doc.status === "verified" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}
                      >
                        {doc.status === "verified" ? "Verified" : "Pending"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
