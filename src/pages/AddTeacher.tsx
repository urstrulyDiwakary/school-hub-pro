import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  BookOpen,
  Wallet,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  "Mathematics",
  "English",
  "Hindi",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Studies",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
];

const qualifications = [
  "B.Ed",
  "M.Ed",
  "B.A",
  "M.A",
  "B.Sc",
  "M.Sc",
  "B.Com",
  "M.Com",
  "Ph.D",
  "D.El.Ed",
];

export default function AddTeacher() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Teacher Added Successfully",
      description: "The teacher record has been created.",
    });

    setIsLoading(false);
    navigate("/teachers");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/teachers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="page-header mb-0">
          <h1 className="page-title">Add New Teacher</h1>
          <p className="page-description">
            Fill in the teacher information to create a new record
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Photo upload */}
          <Card className="form-section lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Teacher Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload photo
                  </p>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                Choose File
              </Button>
            </CardContent>
          </Card>

          {/* Right column - Personal Info */}
          <Card className="form-section lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="Enter first name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Enter last name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="teacher@school.edu" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input id="mobile" placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  rows={2}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Qualification & Experience */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              Qualification & Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="Auto-generated"
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest Qualification *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualifications.map((qual) => (
                    <SelectItem key={qual} value={qual.toLowerCase()}>
                      {qual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" placeholder="e.g., Mathematics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years) *</Label>
              <Input id="experience" type="number" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Joining Date *</Label>
              <Input id="joinDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="senior">Senior Teacher</SelectItem>
                  <SelectItem value="hod">Head of Department</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subject Assignment */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Subject Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-4 block">Select subjects to teach *</Label>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <Checkbox
                    id={subject}
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={() => toggleSubject(subject)}
                  />
                  <Label htmlFor={subject} className="cursor-pointer text-sm">
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSubjects.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedSubjects.join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Details */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" />
              Salary & Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary *</Label>
              <Input id="basicSalary" type="number" placeholder="₹ 0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hra">HRA</Label>
              <Input id="hra" type="number" placeholder="₹ 0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowances">Other Allowances</Label>
              <Input id="allowances" type="number" placeholder="₹ 0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf">PF Deduction</Label>
              <Input id="pf" type="number" placeholder="₹ 0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="Enter bank name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account Number</Label>
              <Input id="accountNo" placeholder="Enter account number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input id="ifsc" placeholder="Enter IFSC code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panCard">PAN Card Number</Label>
              <Input id="panCard" placeholder="XXXXX0000X" />
            </div>
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/teachers")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save Teacher"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
