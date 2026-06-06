import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { ChildSwitcher } from "@/components/portal/ChildSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useActiveStudent } from "@/hooks/useActiveStudent";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const seed: LeaveRequest[] = [
  { id: "L1", from: "2025-05-12", to: "2025-05-13", reason: "Fever", status: "approved" },
  { id: "L2", from: "2025-06-02", to: "2025-06-02", reason: "Family function", status: "pending" },
];

const statusCls: Record<LeaveRequest["status"], string> = {
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
};

export default function ParentLeave() {
  const { toast } = useToast();
  const { student } = useActiveStudent();
  const [requests, setRequests] = useState<LeaveRequest[]>(seed);
  const [form, setForm] = useState({ from: "", to: "", reason: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason.trim()) {
      toast({ title: "Missing details", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    setRequests((r) => [{ id: `L${Date.now()}`, ...form, status: "pending" }, ...r]);
    setForm({ from: "", to: "", reason: "" });
    toast({ title: "Leave submitted", description: "Awaiting class teacher approval." });
  };

  return (
    <PortalPage title="Leave Requests" description="Submit leave & track approval status" actions={<ChildSwitcher />}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Submit Leave Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from">From</Label>
                  <Input id="from" type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to">To</Label>
                  <Input id="to" type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" rows={3} maxLength={300} placeholder={`Reason for ${student?.name ?? "your child"}'s leave`} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Request History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.from).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – {new Date(r.to).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusCls[r.status])}>{r.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalPage>
  );
}
