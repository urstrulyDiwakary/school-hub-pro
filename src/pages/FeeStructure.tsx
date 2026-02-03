import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CreditCard,
  Download,
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

const feeStructureData = [
  {
    id: "1",
    class: "Class 1-5",
    tuitionFee: 35000,
    busFee: 15000,
    examFee: 5000,
    labFee: 0,
    libraryFee: 2000,
    activityFee: 3000,
    total: 60000,
  },
  {
    id: "2",
    class: "Class 6-8",
    tuitionFee: 45000,
    busFee: 15000,
    examFee: 6000,
    labFee: 5000,
    libraryFee: 2500,
    activityFee: 3500,
    total: 77000,
  },
  {
    id: "3",
    class: "Class 9-10",
    tuitionFee: 55000,
    busFee: 15000,
    examFee: 8000,
    labFee: 8000,
    libraryFee: 3000,
    activityFee: 4000,
    total: 93000,
  },
  {
    id: "4",
    class: "Class 11-12 Science",
    tuitionFee: 70000,
    busFee: 15000,
    examFee: 10000,
    labFee: 12000,
    libraryFee: 3500,
    activityFee: 4500,
    total: 115000,
  },
  {
    id: "5",
    class: "Class 11-12 Commerce",
    tuitionFee: 60000,
    busFee: 15000,
    examFee: 8000,
    labFee: 5000,
    libraryFee: 3000,
    activityFee: 4000,
    total: 95000,
  },
  {
    id: "6",
    class: "Class 11-12 Arts",
    tuitionFee: 55000,
    busFee: 15000,
    examFee: 7000,
    labFee: 3000,
    libraryFee: 3000,
    activityFee: 4000,
    total: 87000,
  },
];

export default function FeeStructure() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    toast({
      title: "Fee Structure Updated",
      description: "The fee structure has been saved successfully.",
    });
    setIsDialogOpen(false);
  };

  const filteredData = feeStructureData.filter((item) =>
    item.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Fee Structure</h1>
          <p className="page-description">
            Configure class-wise fee structure for the academic year
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Fee Structure</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class / Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">Class 1-5</SelectItem>
                      <SelectItem value="6-8">Class 6-8</SelectItem>
                      <SelectItem value="9-10">Class 9-10</SelectItem>
                      <SelectItem value="11-12-sci">Class 11-12 Science</SelectItem>
                      <SelectItem value="11-12-com">Class 11-12 Commerce</SelectItem>
                      <SelectItem value="11-12-arts">Class 11-12 Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tuitionFee">Tuition Fee</Label>
                    <Input id="tuitionFee" type="number" placeholder="₹ 0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="busFee">Bus Fee</Label>
                    <Input id="busFee" type="number" placeholder="₹ 0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examFee">Exam Fee</Label>
                    <Input id="examFee" type="number" placeholder="₹ 0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labFee">Lab Fee</Label>
                    <Input id="labFee" type="number" placeholder="₹ 0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="libraryFee">Library Fee</Label>
                    <Input id="libraryFee" type="number" placeholder="₹ 0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityFee">Activity Fee</Label>
                    <Input id="activityFee" type="number" placeholder="₹ 0" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Structure</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-sm text-muted-foreground">Fee Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹60K</p>
                <p className="text-sm text-muted-foreground">Min Fee (1-5)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <CreditCard className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹1.15L</p>
                <p className="text-sm text-muted-foreground">Max Fee (11-12)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <CreditCard className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2024-25</p>
                <p className="text-sm text-muted-foreground">Academic Year</p>
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
              placeholder="Search by class..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure Table */}
      <Card className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Tuition Fee</th>
                <th>Bus Fee</th>
                <th>Exam Fee</th>
                <th>Lab Fee</th>
                <th>Library Fee</th>
                <th>Activity Fee</th>
                <th>Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-foreground">{item.class}</td>
                  <td>{formatCurrency(item.tuitionFee)}</td>
                  <td>{formatCurrency(item.busFee)}</td>
                  <td>{formatCurrency(item.examFee)}</td>
                  <td>{formatCurrency(item.labFee)}</td>
                  <td>{formatCurrency(item.libraryFee)}</td>
                  <td>{formatCurrency(item.activityFee)}</td>
                  <td className="font-bold text-primary">{formatCurrency(item.total)}</td>
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
