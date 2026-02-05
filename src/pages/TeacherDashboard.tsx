 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import {
   Users,
   BookOpen,
   ClipboardCheck,
   FileText,
   Calendar,
   Clock,
   ChevronRight,
   Bell,
   CheckCircle,
   AlertCircle,
 } from "lucide-react";
 import { Link } from "react-router-dom";
 
 // Mock data for teacher dashboard
 const teacherData = {
   name: "Mr. Rajesh Kumar",
   subject: "Mathematics",
   stats: {
     totalClasses: 4,
     totalStudents: 142,
     pendingHomework: 3,
     pendingMarks: 2,
   },
   assignedClasses: [
     { id: 1, name: "Class 10-A", students: 38, subject: "Mathematics", nextClass: "Today, 10:30 AM" },
     { id: 2, name: "Class 10-B", students: 36, subject: "Mathematics", nextClass: "Today, 12:00 PM" },
     { id: 3, name: "Class 9-A", students: 35, subject: "Mathematics", nextClass: "Tomorrow, 9:00 AM" },
     { id: 4, name: "Class 9-B", students: 33, subject: "Mathematics", nextClass: "Tomorrow, 11:30 AM" },
   ],
   todaySchedule: [
     { time: "9:00 AM", class: "Class 10-A", room: "Room 201", status: "completed" },
     { time: "10:30 AM", class: "Class 10-B", room: "Room 203", status: "ongoing" },
     { time: "12:00 PM", class: "Class 9-A", room: "Room 105", status: "upcoming" },
     { time: "2:00 PM", class: "Class 9-B", room: "Room 107", status: "upcoming" },
   ],
   recentActivity: [
     { id: 1, action: "Homework submitted", class: "Class 10-A", count: 32, time: "2 hours ago" },
     { id: 2, action: "Marks uploaded", class: "Class 9-B", subject: "Unit Test 2", time: "Yesterday" },
     { id: 3, action: "Remark added", student: "Rahul Sharma", type: "Academic", time: "Yesterday" },
     { id: 4, action: "Attendance marked", class: "Class 10-A", time: "Today, 9:15 AM" },
   ],
   announcements: [
     { id: 1, title: "Staff Meeting", date: "Feb 6, 2026", priority: "high" },
     { id: 2, title: "Report Card Submission Deadline", date: "Feb 10, 2026", priority: "medium" },
   ],
 };
 
 const TeacherDashboard = () => {
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
             Welcome, {teacherData.name}
           </h1>
           <p className="text-muted-foreground">
             {teacherData.subject} Teacher • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" asChild>
             <Link to="/teacher/homework">
               <FileText className="mr-2 h-4 w-4" />
               Assign Homework
             </Link>
           </Button>
           <Button asChild>
             <Link to="/teacher/attendance">
               <ClipboardCheck className="mr-2 h-4 w-4" />
               Mark Attendance
             </Link>
           </Button>
         </div>
       </div>
 
       {/* Stats Cards */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
             <BookOpen className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{teacherData.stats.totalClasses}</div>
             <p className="text-xs text-muted-foreground">Active this semester</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Students</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{teacherData.stats.totalStudents}</div>
             <p className="text-xs text-muted-foreground">Across all classes</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending Homework</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-warning">{teacherData.stats.pendingHomework}</div>
             <p className="text-xs text-muted-foreground">To be reviewed</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending Marks</CardTitle>
             <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-destructive">{teacherData.stats.pendingMarks}</div>
             <p className="text-xs text-muted-foreground">Exams to grade</p>
           </CardContent>
         </Card>
       </div>
 
       <div className="grid gap-6 lg:grid-cols-3">
         {/* Today's Schedule */}
         <Card className="lg:col-span-1">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Calendar className="h-5 w-5" />
               Today's Schedule
             </CardTitle>
             <CardDescription>Your classes for today</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {teacherData.todaySchedule.map((schedule, index) => (
                 <div
                   key={index}
                   className={`flex items-center gap-3 rounded-lg border p-3 ${
                     schedule.status === "ongoing" ? "border-primary bg-primary/5" : ""
                   }`}
                 >
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                     <Clock className="h-4 w-4 text-muted-foreground" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium truncate">{schedule.class}</p>
                     <p className="text-xs text-muted-foreground">
                       {schedule.time} • {schedule.room}
                     </p>
                   </div>
                   <Badge
                     variant={
                       schedule.status === "completed"
                         ? "secondary"
                         : schedule.status === "ongoing"
                         ? "default"
                         : "outline"
                     }
                   >
                     {schedule.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                     {schedule.status}
                   </Badge>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Assigned Classes */}
         <Card className="lg:col-span-2">
           <CardHeader>
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle>My Classes</CardTitle>
                 <CardDescription>Classes assigned to you this semester</CardDescription>
               </div>
               <Button variant="ghost" size="sm" asChild>
                 <Link to="/teacher/classes">
                   View All <ChevronRight className="ml-1 h-4 w-4" />
                 </Link>
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             <div className="grid gap-4 sm:grid-cols-2">
               {teacherData.assignedClasses.map((cls) => (
                 <div
                   key={cls.id}
                   className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                 >
                   <div className="space-y-1">
                     <p className="font-semibold">{cls.name}</p>
                     <p className="text-sm text-muted-foreground">{cls.subject}</p>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Users className="h-3 w-3" />
                       {cls.students} students
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-muted-foreground">Next Class</p>
                     <p className="text-sm font-medium">{cls.nextClass}</p>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
 
       <div className="grid gap-6 lg:grid-cols-2">
         {/* Recent Activity */}
         <Card>
           <CardHeader>
             <CardTitle>Recent Activity</CardTitle>
             <CardDescription>Your latest actions and updates</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {teacherData.recentActivity.map((activity) => (
                 <div key={activity.id} className="flex items-start gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                     <CheckCircle className="h-4 w-4 text-primary" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium">{activity.action}</p>
                     <p className="text-xs text-muted-foreground">
                       {activity.class || activity.student}
                       {activity.count && ` • ${activity.count} submissions`}
                       {activity.subject && ` • ${activity.subject}`}
                     </p>
                   </div>
                   <span className="text-xs text-muted-foreground whitespace-nowrap">
                     {activity.time}
                   </span>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Announcements */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Bell className="h-5 w-5" />
               Announcements
             </CardTitle>
             <CardDescription>Important notices and updates</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {teacherData.announcements.map((announcement) => (
                 <div
                   key={announcement.id}
                   className="flex items-start gap-3 rounded-lg border p-3"
                 >
                   <AlertCircle
                     className={`h-5 w-5 ${
                       announcement.priority === "high"
                         ? "text-destructive"
                         : "text-warning"
                     }`}
                   />
                   <div className="flex-1">
                     <p className="font-medium">{announcement.title}</p>
                     <p className="text-xs text-muted-foreground">{announcement.date}</p>
                   </div>
                   <Badge
                     variant={announcement.priority === "high" ? "destructive" : "secondary"}
                   >
                     {announcement.priority}
                   </Badge>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Quick Actions */}
       <Card>
         <CardHeader>
           <CardTitle>Quick Actions</CardTitle>
           <CardDescription>Frequently used features</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
             <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
               <Link to="/teacher/homework">
                 <FileText className="h-6 w-6" />
                 <span>Assign Homework</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
               <Link to="/teacher/marks">
                 <ClipboardCheck className="h-6 w-6" />
                 <span>Enter Marks</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
               <Link to="/teacher/remarks">
                 <BookOpen className="h-6 w-6" />
                 <span>Add Remarks</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
               <Link to="/teacher/attendance">
                 <Calendar className="h-6 w-6" />
                 <span>View Attendance</span>
               </Link>
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default TeacherDashboard;