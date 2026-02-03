import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  Briefcase,
  Wallet,
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
import { useToast } from "@/hooks/use-toast";

const categories = ["Office Staff", "Driver", "Helper", "Watchman", "Gardener", "Cook"];
const designations = {
  "Office Staff": ["Accountant", "Receptionist", "Lab Assistant", "Clerk", "Data Entry Operator"],
  Driver: ["Bus Driver", "Van Driver", "Car Driver"],
  Helper: ["Peon", "Sweeper", "Cleaner", "Attendant"],
  Watchman: ["Security Guard", "Night Watchman", "Gate Keeper"],
  Gardener: ["Head Gardener", "Assistant Gardener"],
  Cook: ["Head Cook", "Assistant Cook", "Kitchen Helper"],
};

export default function AddStaff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Staff Added Successfully",
      description: "The staff record has been created.",
    });

    setIsLoading(false);
    navigate("/staff");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/staff")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="page-header mb-0">
          <h1 className="page-title">Add New Staff</h1>
          <p className="page-description">
            Fill in the staff information to create a new record
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
                Staff Photo
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
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input id="mobile" placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input id="aadhaar" placeholder="XXXX XXXX XXXX" />
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

        {/* Employment Details */}
        <Card className="form-section">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5" />
              Employment Details
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
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Select disabled={!selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory &&
                    designations[selectedCategory as keyof typeof designations]?.map((des) => (
                      <SelectItem key={des} value={des}>
                        {des}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Joining Date *</Label>
              <Input id="joinDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Work Shift</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                  <SelectItem value="day">Day (8 AM - 4 PM)</SelectItem>
                  <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                  <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportingTo">Reporting To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Officer</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="manager">Office Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="allowances">Allowances</Label>
              <Input id="allowances" type="number" placeholder="₹ 0" />
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
            onClick={() => navigate("/staff")}
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
              "Save Staff"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
