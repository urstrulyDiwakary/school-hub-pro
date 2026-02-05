 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import {
   Plus,
   FileText,
   Upload,
   Calendar,
   Users,
   Eye,
   Edit,
   Trash2,
   Download,
   CheckCircle,
   Clock,
   AlertCircle,
 } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 
 // Mock data
 const homeworkList = [
   {
     id: 1,
     title: "Quadratic Equations Practice",
     class: "Class 10-A",
     subject: "Mathematics",
     assignedDate: "2026-02-03",
     dueDate: "2026-02-07",
     submissions: 32,
     totalStudents: 38,
     status: "active",
     attachment: "quadratic_worksheet.pdf",
   },
   {
     id: 2,
     title: "Trigonometry Chapter 5 Exercises",
     class: "Class 10-B",
     subject: "Mathematics",
     assignedDate: "2026-02-02",
     dueDate: "2026-02-06",
     submissions: 36,
     totalStudents: 36,
     status: "completed",
     attachment: null,
   },
   {
     id: 3,
     title: "Algebra Word Problems",
     class: "Class 9-A",
     subject: "Mathematics",
     assignedDate: "2026-02-04",
     dueDate: "2026-02-10",
     submissions: 15,
     totalStudents: 35,
     status: "active",
     attachment: "algebra_problems.pdf",
   },
   {
     id: 4,
     title: "Statistics Project",
     class: "Class 9-B",
     subject: "Mathematics",
     assignedDate: "2026-01-28",
     dueDate: "2026-02-04",
     submissions: 28,
     totalStudents: 33,
     status: "overdue",
     attachment: "project_guidelines.pdf",
   },
 ];
 
 const classes = [
   { id: 1, name: "Class 10-A", students: 38 },
   { id: 2, name: "Class 10-B", students: 36 },
   { id: 3, name: "Class 9-A", students: 35 },
   { id: 4, name: "Class 9-B", students: 33 },
 ];
 
 const TeacherHomework = () => {
   const { toast } = useToast();
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [filterClass, setFilterClass] = useState("all");
   const [filterStatus, setFilterStatus] = useState("all");
 
   const filteredHomework = homeworkList.filter((hw) => {
     if (filterClass !== "all" && hw.class !== filterClass) return false;
     if (filterStatus !== "all" && hw.status !== filterStatus) return false;
     return true;
   });
 
   const handleCreateHomework = () => {
     toast({
       title: "Homework Created",
       description: "New homework assignment has been created successfully.",
     });
     setIsDialogOpen(false);
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "active":
         return <Badge className="bg-primary"><Clock className="mr-1 h-3 w-3" />Active</Badge>;
       case "completed":
         return <Badge variant="secondary" className="bg-success/20 text-success"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
       case "overdue":
         return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Overdue</Badge>;
       default:
         return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Homework Management</h1>
           <p className="text-muted-foreground">Create, manage, and track homework assignments</p>
         </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <Plus className="mr-2 h-4 w-4" />
               Assign Homework
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-2xl">
             <DialogHeader>
               <DialogTitle>Create New Homework</DialogTitle>
               <DialogDescription>
                 Assign a new homework to your students
               </DialogDescription>
             </DialogHeader>
             <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                 <Label htmlFor="title">Homework Title</Label>
                 <Input id="title" placeholder="Enter homework title" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                   <Label htmlFor="class">Select Class</Label>
                   <Select>
                     <SelectTrigger>
                       <SelectValue placeholder="Select class" />
                     </SelectTrigger>
                     <SelectContent>
                       {classes.map((cls) => (
                         <SelectItem key={cls.id} value={cls.name}>
                           {cls.name} ({cls.students} students)
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid gap-2">
                   <Label htmlFor="dueDate">Due Date</Label>
                   <Input id="dueDate" type="date" />
                 </div>
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="description">Description</Label>
                 <Textarea
                   id="description"
                   placeholder="Enter homework instructions and details"
                   rows={4}
                 />
               </div>
               <div className="grid gap-2">
                 <Label>Attachment (Optional)</Label>
                 <div className="flex items-center gap-4">
                   <Button variant="outline" className="w-full">
                     <Upload className="mr-2 h-4 w-4" />
                     Upload File
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">
                   Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                 </p>
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleCreateHomework}>Create Homework</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Stats Cards */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{homeworkList.length}</div>
             <p className="text-xs text-muted-foreground">This semester</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active</CardTitle>
             <Clock className="h-4 w-4 text-primary" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-primary">
               {homeworkList.filter((h) => h.status === "active").length}
             </div>
             <p className="text-xs text-muted-foreground">Awaiting submissions</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Completed</CardTitle>
             <CheckCircle className="h-4 w-4 text-success" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-success">
               {homeworkList.filter((h) => h.status === "completed").length}
             </div>
             <p className="text-xs text-muted-foreground">All submitted</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Overdue</CardTitle>
             <AlertCircle className="h-4 w-4 text-destructive" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-destructive">
               {homeworkList.filter((h) => h.status === "overdue").length}
             </div>
             <p className="text-xs text-muted-foreground">Past due date</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Filters */}
       <Card>
         <CardHeader>
           <CardTitle>Homework List</CardTitle>
           <CardDescription>View and manage all homework assignments</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="mb-4 flex flex-col gap-4 sm:flex-row">
             <Select value={filterClass} onValueChange={setFilterClass}>
               <SelectTrigger className="w-full sm:w-[180px]">
                 <SelectValue placeholder="Filter by class" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Classes</SelectItem>
                 {classes.map((cls) => (
                   <SelectItem key={cls.id} value={cls.name}>
                     {cls.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Select value={filterStatus} onValueChange={setFilterStatus}>
               <SelectTrigger className="w-full sm:w-[180px]">
                 <SelectValue placeholder="Filter by status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="active">Active</SelectItem>
                 <SelectItem value="completed">Completed</SelectItem>
                 <SelectItem value="overdue">Overdue</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           <div className="rounded-md border overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Title</TableHead>
                   <TableHead>Class</TableHead>
                   <TableHead className="hidden md:table-cell">Assigned</TableHead>
                   <TableHead>Due Date</TableHead>
                   <TableHead>Submissions</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredHomework.map((hw) => (
                   <TableRow key={hw.id}>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <FileText className="h-4 w-4 text-muted-foreground" />
                         <div>
                           <p className="font-medium">{hw.title}</p>
                           {hw.attachment && (
                             <p className="text-xs text-muted-foreground flex items-center gap-1">
                               <Download className="h-3 w-3" />
                               {hw.attachment}
                             </p>
                           )}
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>{hw.class}</TableCell>
                     <TableCell className="hidden md:table-cell">
                       {new Date(hw.assignedDate).toLocaleDateString()}
                     </TableCell>
                     <TableCell>
                       {new Date(hw.dueDate).toLocaleDateString()}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <span>
                           {hw.submissions}/{hw.totalStudents}
                         </span>
                       </div>
                     </TableCell>
                     <TableCell>{getStatusBadge(hw.status)}</TableCell>
                     <TableCell>
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon">
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon">
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default TeacherHomework;