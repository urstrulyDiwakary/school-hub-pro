import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";
import { feeService, formatINR } from "@/services/feeService";
import type { FeeItem, FeeStatus } from "@/data/portal/fees";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusMeta: Record<FeeStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-success/10 text-success" },
  pending: { label: "Pending", cls: "bg-warning/10 text-warning" },
  overdue: { label: "Overdue", cls: "bg-destructive/10 text-destructive" },
};

function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function FeesView({ studentId, studentName, readOnly }: { studentId: string; studentName: string; readOnly?: boolean }) {
  const { toast } = useToast();
  const summary = feeService.getSummary(studentId);
  const all = feeService.getAll(studentId);
  const history = feeService.getPaymentHistory(studentId);
  const upcoming = feeService.getUpcomingDues(studentId);

  const downloadReceipt = (fee: FeeItem) => {
    const text = feeService.buildReceiptText(fee, studentName);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fee.receiptNo ?? "receipt"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Receipt downloaded", description: fee.receiptNo });
  };

  return (
    <div className="space-y-6">
      <div className="responsive-grid-4">
        <StatCard label="Total Fees" value={formatINR(summary.total)} icon={IndianRupee} tone="primary" />
        <StatCard label="Paid" value={formatINR(summary.paid)} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={formatINR(summary.pending)} icon={Clock} tone="warning" />
        <StatCard label="Overdue" value={formatINR(summary.overdue)} icon={AlertTriangle} tone="destructive" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="scroll-x-mobile">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fee Head</th>
                <th>Term</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {all.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.head}</td>
                  <td>{f.term}</td>
                  <td>{formatINR(f.amount)}</td>
                  <td>{fmtDate(f.dueDate)}</td>
                  <td>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusMeta[f.status].cls)}>
                      {statusMeta[f.status].label}
                    </span>
                  </td>
                  <td>
                    {f.status === "paid" ? (
                      <Button variant="ghost" size="sm" onClick={() => downloadReceipt(f)}>
                        <Download className="h-4 w-4" /> Receipt
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming Dues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No dues. You're all caught up!</p>}
            {upcoming.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{f.head} · {f.term}</p>
                  <p className="text-xs text-muted-foreground">Due {fmtDate(f.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatINR(f.amount)}</p>
                  {!readOnly && f.status !== "paid" && (
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => toast({ title: "Payment", description: "Redirecting to payment gateway (demo)." })}>
                      Pay now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
            {history.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{f.head} · {f.term}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(f.paidDate)} · {f.method}</p>
                </div>
                <p className="text-sm font-semibold text-success">{formatINR(f.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
