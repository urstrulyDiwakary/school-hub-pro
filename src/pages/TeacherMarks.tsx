 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
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
   ClipboardCheck,
   Save,
   FileDown,
   Search,
   CheckCircle,
   AlertCircle,
   Calculator,
 } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 
 // Mock data
 const examTypes = [
   { id: 1, name: "Unit Test 1", maxMarks: 25 },
   { id: 2, name: "Unit Test 2", maxMarks: 25 },
   { id: 3, name: "Mid Term", maxMarks: 100 },
   { id: 4, name: "Final Term", maxMarks: 100 },
 ];
 
 const classes = [
   { id: 1, name: "Class 10-A" },
   { id: 2, name: "Class 10-B" },
   { id: 3, name: "Class 9-A" },
   { id: 4, name: "Class 9-B" },
 ];
 
 const studentsData = [
   { id: 1, rollNo: "001", name: "Aarav Patel", marks: 22, grade: "A", status: "saved" },
   { id: 2, rollNo: "002", name: "Aditi Sharma", marks: 24, grade: "A+", status: "saved" },
   { id: 3, rollNo: "003", name: "Arjun Singh", marks: 18, grade: "B+", status: "saved" },
   { id: 4, rollNo: "004", name: "Diya Gupta", marks: null, grade: "-", status: "pending" },
   { id: 5, rollNo: "005", name: "Ishaan Kumar", marks: 20, grade: "A", status: "saved" },
   { id: 6, rollNo: "006", name: "Kavya Reddy", marks: null, grade: "-", status: "pending" },
   { id: 7, rollNo: "007", name: "Rohan Joshi", marks: 15, grade: "B", status: "saved" },
   { id: 8, rollNo: "008", name: "Priya Nair", marks: 23, grade: "A", status: "saved" },
   { id: 9, rollNo: "009", name: "Vivaan Mehta", marks: 19, grade: "B+", status: "saved" },
   { id: 10, rollNo: "010", name: "Ananya Das", marks: 21, grade: "A", status: "saved" },
 ];
 
 const TeacherMarks = () => {
   const { toast } = useToast();
   const [selectedClass, setSelectedClass] = useState("");
   const [selectedExam, setSelectedExam] = useState("");
   const [students, setStudents] = useState(studentsData);
   const [searchTerm, setSearchTerm] = useState("");
 
   const maxMarks = examTypes.find((e) => e.name === selectedExam)?.maxMarks || 25;
 
   const calculateGrade = (marks: number | null, max: number): string => {
     if (marks === null) return "-";
     const percentage = (marks / max) * 100;
     if (percentage >= 90) return "A+";
     if (percentage >= 80) return "A";
     if (percentage >= 70) return "B+";
     if (percentage >= 60) return "B";
     if (percentage >= 50) return "C";
     if (percentage >= 40) return "D";
     return "F";
   };
 
   const handleMarksChange = (studentId: number, value: string) => {
     const marks = value === "" ? null : Math.min(Math.max(0, parseInt(value) || 0), maxMarks);
     setStudents((prev) =>
       prev.map((s) =>
         s.id === studentId
           ? { ...s, marks, grade: calculateGrade(marks, maxMarks), status: "pending" }
           : s
       )
     );
   };
 
   const handleSaveAll = () => {
     setStudents((prev) =>
       prev.map((s) => ({ ...s, status: s.marks !== null ? "saved" : "pending" }))
     );
     toast({
       title: "Marks Saved",
       description: "All marks have been saved successfully.",
     });
   };
 
   const filteredStudents = students.filter((s) =>
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.rollNo.includes(searchTerm)
   );
 
   const savedCount = students.filter((s) => s.status === "saved").length;
   const pendingCount = students.filter((s) => s.status === "pending").length;
   const avgMarks =
     students.filter((s) => s.marks !== null).reduce((acc, s) => acc + (s.marks || 0), 0) /
     students.filter((s) => s.marks !== null).length || 0;
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Marks Entry</h1>
           <p className="text-muted-foreground">Enter and manage student examination marks</p>
         </div>
         <div className="flex gap-2">
           <Button variant="outline">
             <FileDown className="mr-2 h-4 w-4" />
             Export
           </Button>
           <Button onClick={handleSaveAll}>
             <Save className="mr-2 h-4 w-4" />
             Save All
           </Button>
         </div>
       </div>
 
       {/* Filters */}
       <Card>
         <CardHeader>
           <CardTitle>Select Class & Exam</CardTitle>
           <CardDescription>Choose the class and examination to enter marks</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
             <div className="space-y-2">
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
             <div className="space-y-2">
               <Label>Select Examination</Label>
               <Select value={selectedExam} onValueChange={setSelectedExam}>
                 <SelectTrigger>
                   <SelectValue placeholder="Choose exam" />
                 </SelectTrigger>
                 <SelectContent>
                   {examTypes.map((exam) => (
                     <SelectItem key={exam.id} value={exam.name}>
                       {exam.name} (Max: {exam.maxMarks})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label>Subject</Label>
               <Input value="Mathematics" disabled />
             </div>
             <div className="space-y-2">
               <Label>Max Marks</Label>
               <Input value={maxMarks} disabled />
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Students</CardTitle>
             <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{students.length}</div>
             <p className="text-xs text-muted-foreground">In selected class</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Marks Entered</CardTitle>
             <CheckCircle className="h-4 w-4 text-success" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-success">{savedCount}</div>
             <p className="text-xs text-muted-foreground">Students graded</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending</CardTitle>
             <AlertCircle className="h-4 w-4 text-warning" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-warning">{pendingCount}</div>
             <p className="text-xs text-muted-foreground">Yet to enter</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Class Average</CardTitle>
             <Calculator className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{avgMarks.toFixed(1)}</div>
             <p className="text-xs text-muted-foreground">Out of {maxMarks}</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Marks Table */}
       <Card>
         <CardHeader>
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div>
               <CardTitle>Student Marks</CardTitle>
               <CardDescription>
                 Enter marks for each student. Grades are calculated automatically.
               </CardDescription>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                 placeholder="Search by name or roll..."
                 className="pl-9 w-full sm:w-64"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="rounded-md border overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-20">Roll No</TableHead>
                   <TableHead>Student Name</TableHead>
                   <TableHead className="w-32">Marks (/{maxMarks})</TableHead>
                   <TableHead className="w-24">Grade</TableHead>
                   <TableHead className="w-24">Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredStudents.map((student) => (
                   <TableRow key={student.id}>
                     <TableCell className="font-medium">{student.rollNo}</TableCell>
                     <TableCell>{student.name}</TableCell>
                     <TableCell>
                       <Input
                         type="number"
                         min="0"
                         max={maxMarks}
                         value={student.marks ?? ""}
                         onChange={(e) => handleMarksChange(student.id, e.target.value)}
                         className="w-20"
                         placeholder="-"
                       />
                     </TableCell>
                     <TableCell>
                       <Badge
                         variant={
                           student.grade === "A+" || student.grade === "A"
                             ? "default"
                             : student.grade === "F"
                             ? "destructive"
                             : "secondary"
                         }
                       >
                         {student.grade}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {student.status === "saved" ? (
                         <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                           <CheckCircle className="mr-1 h-3 w-3" />
                           Saved
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                           <AlertCircle className="mr-1 h-3 w-3" />
                           Pending
                         </Badge>
                       )}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
           
           {/* Grade Legend */}
           <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
             <span className="font-medium">Grade Scale:</span>
             <span>A+ (≥90%)</span>
             <span>A (80-89%)</span>
             <span>B+ (70-79%)</span>
             <span>B (60-69%)</span>
             <span>C (50-59%)</span>
             <span>D (40-49%)</span>
             <span>F (&lt;40%)</span>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default TeacherMarks;