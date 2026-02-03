import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  BookOpen,
  Users,
  HeartPulse,
  FileText,
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];
const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AddStudent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Student Added Successfully",
      description: "The student record has been created.",
    });

    setIsLoading(false);
    navigate("/students");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/students")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="page-header mb-0">
          <h1 className="page-title">Add New Student</h1>
          <p className="page-description">
            Fill in the student information to create a new record
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
                Student Photo
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
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG up to 2MB
              </p>
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
                    {genders.map((g) => (
                      <SelectItem key={g} value={g.toLowerCase()}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input id="aadhaar" placeholder="XXXX XXXX XXXX" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Information */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="admissionNo">Admission Number</Label>
              <Input
                id="admissionNo"
                placeholder="Auto-generated"
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input id="rollNo" placeholder="Enter roll number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select defaultValue="2024-25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionDate">Admission Date *</Label>
              <Input id="admissionDate" type="date" required />
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Parent / Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input id="fatherName" placeholder="Enter father's name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherMobile">Father's Mobile *</Label>
              <Input
                id="fatherMobile"
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherOccupation">Father's Occupation</Label>
              <Input id="fatherOccupation" placeholder="Enter occupation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother's Name *</Label>
              <Input id="motherName" placeholder="Enter mother's name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherMobile">Mother's Mobile</Label>
              <Input id="motherMobile" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherOccupation">Mother's Occupation</Label>
              <Input id="motherOccupation" placeholder="Enter occupation" />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="whatsapp"
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
              <Label htmlFor="whatsapp" className="cursor-pointer">
                Enable WhatsApp notifications
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" placeholder="Enter any allergies" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditions">Health Conditions</Label>
              <Input id="conditions" placeholder="Any chronic conditions" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" placeholder="+91 XXXXX XXXXX" />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Documents Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Birth Certificate",
                "Aadhaar Card",
                "Transfer Certificate",
                "Previous Marksheet",
                "Address Proof",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {doc}
                  </span>
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/students")}
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
              "Save Student"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
