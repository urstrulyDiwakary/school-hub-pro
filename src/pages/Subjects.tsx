import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const subjectsData = [
  {
    id: "1",
    name: "Mathematics",
    code: "MATH",
    type: "Core",
    classes: ["1-10", "11-12 Science"],
    teachers: 8,
  },
  {
    id: "2",
    name: "English",
    code: "ENG",
    type: "Core",
    classes: ["1-12"],
    teachers: 10,
  },
  {
    id: "3",
    name: "Hindi",
    code: "HIN",
    type: "Core",
    classes: ["1-10"],
    teachers: 6,
  },
  {
    id: "4",
    name: "Science",
    code: "SCI",
    type: "Core",
    classes: ["1-10"],
    teachers: 12,
  },
  {
    id: "5",
    name: "Physics",
    code: "PHY",
    type: "Core",
    classes: ["11-12 Science"],
    teachers: 4,
  },
  {
    id: "6",
    name: "Chemistry",
    code: "CHEM",
    type: "Core",
    classes: ["11-12 Science"],
    teachers: 4,
  },
  {
    id: "7",
    name: "Biology",
    code: "BIO",
    type: "Core",
    classes: ["11-12 Science"],
    teachers: 3,
  },
  {
    id: "8",
    name: "Social Studies",
    code: "SST",
    type: "Core",
    classes: ["1-10"],
    teachers: 8,
  },
  {
    id: "9",
    name: "Computer Science",
    code: "CS",
    type: "Elective",
    classes: ["6-12"],
    teachers: 4,
  },
  {
    id: "10",
    name: "Physical Education",
    code: "PE",
    type: "Core",
    classes: ["1-12"],
    teachers: 5,
  },
  {
    id: "11",
    name: "Art & Craft",
    code: "ART",
    type: "Elective",
    classes: ["1-8"],
    teachers: 3,
  },
  {
    id: "12",
    name: "Music",
    code: "MUS",
    type: "Elective",
    classes: ["1-8"],
    teachers: 2,
  },
];

export default function Subjects() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredSubjects = subjectsData.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || subject.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddSubject = () => {
    toast({
      title: "Subject Added",
      description: "New subject has been added successfully.",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Subjects</h1>
          <p className="page-description">
            Manage subjects and curriculum
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input id="subjectName" placeholder="e.g., Mathematics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input id="subjectCode" placeholder="e.g., MATH" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectType">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classes">Applicable Classes</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">Class 1-5</SelectItem>
                    <SelectItem value="6-10">Class 6-10</SelectItem>
                    <SelectItem value="11-12">Class 11-12</SelectItem>
                    <SelectItem value="1-12">All Classes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubject}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <GraduationCap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Core Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <BookOpen className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">Elective Subjects</p>
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
                <p className="text-2xl font-bold text-foreground">69</p>
                <p className="text-sm text-muted-foreground">Teachers Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Type</th>
                <th>Applicable Classes</th>
                <th>Teachers</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{subject.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{subject.code}</td>
                  <td>
                    <span
                      className={
                        subject.type === "Core"
                          ? "inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                          : "inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {subject.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {subject.classes.map((cls) => (
                        <span
                          key={cls}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {subject.teachers}
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
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
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
