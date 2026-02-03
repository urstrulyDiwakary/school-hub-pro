import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  BookOpen,
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

const classesData = [
  {
    id: "1",
    name: "Class 1",
    sections: ["A", "B", "C"],
    totalStudents: 180,
    classTeacher: "Mrs. Sharma",
  },
  {
    id: "2",
    name: "Class 2",
    sections: ["A", "B", "C"],
    totalStudents: 195,
    classTeacher: "Mr. Kumar",
  },
  {
    id: "3",
    name: "Class 3",
    sections: ["A", "B", "C", "D"],
    totalStudents: 210,
    classTeacher: "Mrs. Patel",
  },
  {
    id: "4",
    name: "Class 4",
    sections: ["A", "B", "C", "D"],
    totalStudents: 225,
    classTeacher: "Mr. Singh",
  },
  {
    id: "5",
    name: "Class 5",
    sections: ["A", "B", "C", "D"],
    totalStudents: 240,
    classTeacher: "Mrs. Reddy",
  },
  {
    id: "6",
    name: "Class 6",
    sections: ["A", "B", "C", "D"],
    totalStudents: 255,
    classTeacher: "Mr. Gupta",
  },
  {
    id: "7",
    name: "Class 7",
    sections: ["A", "B", "C", "D"],
    totalStudents: 268,
    classTeacher: "Mrs. Nair",
  },
  {
    id: "8",
    name: "Class 8",
    sections: ["A", "B", "C", "D"],
    totalStudents: 285,
    classTeacher: "Mr. Verma",
  },
  {
    id: "9",
    name: "Class 9",
    sections: ["A", "B", "C", "D", "E"],
    totalStudents: 310,
    classTeacher: "Mrs. Iyer",
  },
  {
    id: "10",
    name: "Class 10",
    sections: ["A", "B", "C", "D", "E"],
    totalStudents: 320,
    classTeacher: "Mr. Joshi",
  },
  {
    id: "11",
    name: "Class 11",
    sections: ["Science", "Commerce", "Arts"],
    totalStudents: 180,
    classTeacher: "Dr. Sharma",
  },
  {
    id: "12",
    name: "Class 12",
    sections: ["Science", "Commerce", "Arts"],
    totalStudents: 179,
    classTeacher: "Dr. Kumar",
  },
];

export default function Classes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classesData.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClass = () => {
    toast({
      title: "Class Added",
      description: "New class has been added successfully.",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Classes</h1>
          <p className="page-description">
            Manage classes and sections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input id="className" placeholder="e.g., Class 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sections">Number of Sections</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Section</SelectItem>
                    <SelectItem value="2">2 Sections</SelectItem>
                    <SelectItem value="3">3 Sections</SelectItem>
                    <SelectItem value="4">4 Sections</SelectItem>
                    <SelectItem value="5">5 Sections</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classTeacher">Class Teacher</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharma">Mrs. Sharma</SelectItem>
                    <SelectItem value="kumar">Mr. Kumar</SelectItem>
                    <SelectItem value="patel">Mrs. Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClass}>Add Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">48</p>
                <p className="text-sm text-muted-foreground">Total Sections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <GraduationCap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2,847</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
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
                <p className="text-2xl font-bold text-foreground">59</p>
                <p className="text-sm text-muted-foreground">Avg. per Section</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="stat-card">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base sm:text-lg">{cls.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
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
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="flex flex-wrap gap-1">
                {cls.sections.map((section) => (
                  <span
                    key={section}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {section}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium text-foreground">{cls.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher</span>
                  <span className="font-medium text-foreground truncate ml-2 max-w-[100px]">{cls.classTeacher}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
