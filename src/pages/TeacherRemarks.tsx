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
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   Plus,
   MessageSquare,
   Search,
   ThumbsUp,
   ThumbsDown,
   BookOpen,
   User,
   Calendar,
   Filter,
   Edit,
   Trash2,
 } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 
 // Mock data
 const remarksList = [
   {
     id: 1,
     studentName: "Aarav Patel",
     rollNo: "001",
     class: "Class 10-A",
     type: "academic",
     sentiment: "positive",
     subject: "Mathematics",
     remark: "Excellent problem-solving skills. Consistently performs well in algebra.",
     date: "2026-02-04",
   },
   {
     id: 2,
     studentName: "Aditi Sharma",
     rollNo: "002",
     class: "Class 10-A",
     type: "behavioral",
     sentiment: "positive",
     subject: null,
     remark: "Shows great leadership qualities. Helpful to classmates.",
     date: "2026-02-03",
   },
   {
     id: 3,
     studentName: "Arjun Singh",
     rollNo: "003",
     class: "Class 10-A",
     type: "academic",
     sentiment: "negative",
     subject: "Mathematics",
     remark: "Needs to improve on geometry concepts. Recommend extra practice.",
     date: "2026-02-02",
   },
   {
     id: 4,
     studentName: "Diya Gupta",
     rollNo: "004",
     class: "Class 10-B",
     type: "behavioral",
     sentiment: "negative",
     subject: null,
     remark: "Frequently distracted in class. Parents meeting scheduled.",
     date: "2026-02-01",
   },
   {
     id: 5,
     studentName: "Ishaan Kumar",
     rollNo: "005",
     class: "Class 9-A",
     type: "academic",
     sentiment: "positive",
     subject: "Mathematics",
     remark: "Outstanding improvement in calculus. Keep up the good work!",
     date: "2026-01-30",
   },
 ];
 
 const classes = [
   { id: 1, name: "Class 10-A" },
   { id: 2, name: "Class 10-B" },
   { id: 3, name: "Class 9-A" },
   { id: 4, name: "Class 9-B" },
 ];
 
 const students = [
   { id: 1, name: "Aarav Patel", rollNo: "001", class: "Class 10-A" },
   { id: 2, name: "Aditi Sharma", rollNo: "002", class: "Class 10-A" },
   { id: 3, name: "Arjun Singh", rollNo: "003", class: "Class 10-A" },
   { id: 4, name: "Diya Gupta", rollNo: "004", class: "Class 10-B" },
   { id: 5, name: "Ishaan Kumar", rollNo: "005", class: "Class 9-A" },
 ];
 
 const TeacherRemarks = () => {
   const { toast } = useToast();
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [filterClass, setFilterClass] = useState("all");
   const [filterType, setFilterType] = useState("all");
   const [filterSentiment, setFilterSentiment] = useState("all");
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedClass, setSelectedClass] = useState("");
   const [selectedStudent, setSelectedStudent] = useState("");
   const [remarkType, setRemarkType] = useState("");
   const [remarkSentiment, setRemarkSentiment] = useState("");
 
   const filteredRemarks = remarksList.filter((remark) => {
     if (filterClass !== "all" && remark.class !== filterClass) return false;
     if (filterType !== "all" && remark.type !== filterType) return false;
     if (filterSentiment !== "all" && remark.sentiment !== filterSentiment) return false;
     if (searchTerm && !remark.studentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
   });
 
   const filteredStudents = students.filter((s) => 
     selectedClass ? s.class === selectedClass : true
   );
 
   const handleAddRemark = () => {
     toast({
       title: "Remark Added",
       description: "Student remark has been added successfully.",
     });
     setIsDialogOpen(false);
     setSelectedClass("");
     setSelectedStudent("");
     setRemarkType("");
     setRemarkSentiment("");
   };
 
   const positiveCount = remarksList.filter((r) => r.sentiment === "positive").length;
   const negativeCount = remarksList.filter((r) => r.sentiment === "negative").length;
   const academicCount = remarksList.filter((r) => r.type === "academic").length;
   const behavioralCount = remarksList.filter((r) => r.type === "behavioral").length;
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Student Remarks</h1>
           <p className="text-muted-foreground">Add academic and behavioral feedback for students</p>
         </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <Plus className="mr-2 h-4 w-4" />
               Add Remark
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-lg">
             <DialogHeader>
               <DialogTitle>Add New Remark</DialogTitle>
               <DialogDescription>
                 Add academic or behavioral remark for a student
               </DialogDescription>
             </DialogHeader>
             <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                 <Label>Select Class</Label>
                 <Select value={selectedClass} onValueChange={setSelectedClass}>
                   <SelectTrigger>
                     <SelectValue placeholder="Choose class" />
                   </SelectTrigger>
                   <SelectContent>
                     {classes.map((cls) => (
                       <SelectItem key={cls.id} value={cls.name}>
                         {cls.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid gap-2">
                 <Label>Select Student</Label>
                 <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                   <SelectTrigger>
                     <SelectValue placeholder="Choose student" />
                   </SelectTrigger>
                   <SelectContent>
                     {filteredStudents.map((student) => (
                       <SelectItem key={student.id} value={student.name}>
                         {student.rollNo} - {student.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                   <Label>Remark Type</Label>
                   <Select value={remarkType} onValueChange={setRemarkType}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select type" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="academic">Academic</SelectItem>
                       <SelectItem value="behavioral">Behavioral</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid gap-2">
                   <Label>Sentiment</Label>
                   <Select value={remarkSentiment} onValueChange={setRemarkSentiment}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="positive">Positive</SelectItem>
                       <SelectItem value="negative">Needs Improvement</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
               <div className="grid gap-2">
                 <Label>Remark</Label>
                 <Textarea
                   placeholder="Enter your observation or feedback about the student..."
                   rows={4}
                 />
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleAddRemark}>Add Remark</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Remarks</CardTitle>
             <MessageSquare className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{remarksList.length}</div>
             <p className="text-xs text-muted-foreground">All time</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Positive</CardTitle>
             <ThumbsUp className="h-4 w-4 text-success" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-success">{positiveCount}</div>
             <p className="text-xs text-muted-foreground">Appreciations</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Needs Work</CardTitle>
             <ThumbsDown className="h-4 w-4 text-destructive" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-destructive">{negativeCount}</div>
             <p className="text-xs text-muted-foreground">Improvements needed</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Academic</CardTitle>
             <BookOpen className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{academicCount}</div>
             <p className="text-xs text-muted-foreground">Subject related</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Filters & Table */}
       <Card>
         <CardHeader>
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div>
               <CardTitle>All Remarks</CardTitle>
               <CardDescription>View and manage student remarks</CardDescription>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                 placeholder="Search student..."
                 className="pl-9 w-full sm:w-64"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {/* Filters */}
           <div className="mb-4 flex flex-wrap gap-2">
             <Select value={filterClass} onValueChange={setFilterClass}>
               <SelectTrigger className="w-[140px]">
                 <SelectValue placeholder="All Classes" />
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
             <Select value={filterType} onValueChange={setFilterType}>
               <SelectTrigger className="w-[140px]">
                 <SelectValue placeholder="All Types" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Types</SelectItem>
                 <SelectItem value="academic">Academic</SelectItem>
                 <SelectItem value="behavioral">Behavioral</SelectItem>
               </SelectContent>
             </Select>
             <Select value={filterSentiment} onValueChange={setFilterSentiment}>
               <SelectTrigger className="w-[140px]">
                 <SelectValue placeholder="All Sentiment" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Sentiment</SelectItem>
                 <SelectItem value="positive">Positive</SelectItem>
                 <SelectItem value="negative">Needs Work</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           {/* Table */}
           <div className="rounded-md border overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Student</TableHead>
                   <TableHead>Class</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead className="hidden md:table-cell">Remark</TableHead>
                   <TableHead>Sentiment</TableHead>
                   <TableHead>Date</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredRemarks.map((remark) => (
                   <TableRow key={remark.id}>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                           <User className="h-4 w-4 text-muted-foreground" />
                         </div>
                         <div>
                           <p className="font-medium">{remark.studentName}</p>
                           <p className="text-xs text-muted-foreground">Roll: {remark.rollNo}</p>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>{remark.class}</TableCell>
                     <TableCell>
                       <Badge variant={remark.type === "academic" ? "default" : "secondary"}>
                         {remark.type === "academic" ? (
                           <BookOpen className="mr-1 h-3 w-3" />
                         ) : (
                           <User className="mr-1 h-3 w-3" />
                         )}
                         {remark.type}
                       </Badge>
                     </TableCell>
                     <TableCell className="hidden md:table-cell max-w-xs">
                       <p className="truncate">{remark.remark}</p>
                     </TableCell>
                     <TableCell>
                       {remark.sentiment === "positive" ? (
                         <Badge className="bg-success/20 text-success border-0">
                           <ThumbsUp className="mr-1 h-3 w-3" />
                           Positive
                         </Badge>
                       ) : (
                         <Badge variant="destructive">
                           <ThumbsDown className="mr-1 h-3 w-3" />
                           Needs Work
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-1 text-muted-foreground">
                         <Calendar className="h-3 w-3" />
                         <span className="text-sm">
                           {new Date(remark.date).toLocaleDateString()}
                         </span>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex justify-end gap-1">
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
 
 export default TeacherRemarks;