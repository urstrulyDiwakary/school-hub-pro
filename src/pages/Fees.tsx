import { useMemo, useState } from "react";
import { CreditCard, Download, Mail, Receipt, MessageSquare } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PageLayout,
  StatisticsRow,
  FilterBar,
  DataTableV2,
  AppDrawer,
  ActivityTimeline,
  ConfirmDialog,
  type ActiveFilter,
  type BulkAction,
  type RowAction,
  type ActivityEvent,
} from "@/components/app";
import { toast } from "sonner";

interface FeeRow {
  id: string;
  studentName: string;
  class: string;
  admissionNo: string;
  totalFee: number;
  paid: number;
  pending: number;
  lastPayment: string;
  status: "paid" | "partial" | "unpaid";
}

const feeData: FeeRow[] = [
  { id: "1", studentName: "Arjun Sharma", class: "10-A", admissionNo: "ADM2024001", totalFee: 85000, paid: 65000, pending: 20000, lastPayment: "2024-10-15", status: "partial" },
  { id: "2", studentName: "Priya Patel", class: "10-A", admissionNo: "ADM2024002", totalFee: 85000, paid: 85000, pending: 0, lastPayment: "2024-09-05", status: "paid" },
  { id: "3", studentName: "Rahul Kumar", class: "9-B", admissionNo: "ADM2024003", totalFee: 75000, paid: 0, pending: 75000, lastPayment: "-", status: "unpaid" },
  { id: "4", studentName: "Sneha Reddy", class: "8-A", admissionNo: "ADM2024004", totalFee: 70000, paid: 35000, pending: 35000, lastPayment: "2024-08-20", status: "partial" },
  { id: "5", studentName: "Amit Singh", class: "10-B", admissionNo: "ADM2024005", totalFee: 85000, paid: 85000, pending: 0, lastPayment: "2024-09-12", status: "paid" },
  { id: "6", studentName: "Kavya Nair", class: "9-A", admissionNo: "ADM2024006", totalFee: 75000, paid: 50000, pending: 25000, lastPayment: "2024-10-02", status: "partial" },
  { id: "7", studentName: "Rohan Gupta", class: "8-B", admissionNo: "ADM2024007", totalFee: 70000, paid: 70000, pending: 0, lastPayment: "2024-08-28", status: "paid" },
  { id: "8", studentName: "Ananya Verma", class: "7-A", admissionNo: "ADM2024008", totalFee: 65000, paid: 0, pending: 65000, lastPayment: "-", status: "unpaid" },
  { id: "9", studentName: "Vikram Reddy", class: "10-A", admissionNo: "ADM2024009", totalFee: 85000, paid: 60000, pending: 25000, lastPayment: "2024-10-18", status: "partial" },
  { id: "10", studentName: "Meera Iyer", class: "9-A", admissionNo: "ADM2024010", totalFee: 75000, paid: 75000, pending: 0, lastPayment: "2024-09-20", status: "paid" },
];

const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const badgeFor = (s: FeeRow["status"]) =>
  s === "paid" ? "badge-active" : s === "partial" ? "badge-pending" : "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive";

function KPI({ label, value, sub, tone }: { label: string; value: string; sub?: React.ReactNode; tone?: "success" | "warning" | "primary" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${t}`}>{value}</p>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function Fees() {
  const [status, setStatus] = useState("");
  const [cls, setCls] = useState("");
  const [receipt, setReceipt] = useState<FeeRow | null>(null);
  const [confirmCollect, setConfirmCollect] = useState<FeeRow | null>(null);

  const data = useMemo(
    () => feeData.filter((f) => (!status || f.status === status) && (!cls || f.class.startsWith(cls))),
    [status, cls],
  );

  const active: ActiveFilter[] = [
    status && { key: "status", label: "Status", value: status, onRemove: () => setStatus("") },
    cls && { key: "class", label: "Class", value: `Class ${cls}`, onRemove: () => setCls("") },
  ].filter(Boolean) as ActiveFilter[];

  const columns: ColumnDef<FeeRow>[] = useMemo(
    () => [
      {
        accessorKey: "studentName",
        header: "Student",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.studentName}</p>
            <p className="text-xs text-muted-foreground">{row.original.class}</p>
          </div>
        ),
      },
      { accessorKey: "admissionNo", header: "Admission No.", cell: (c) => <span className="font-mono text-sm">{c.getValue<string>()}</span> },
      { accessorKey: "totalFee", header: "Total", cell: (c) => <span className="font-medium">{formatINR(c.getValue<number>())}</span> },
      { accessorKey: "paid", header: "Paid", cell: (c) => <span className="text-success">{formatINR(c.getValue<number>())}</span> },
      { accessorKey: "pending", header: "Pending", cell: (c) => <span className={c.getValue<number>() > 0 ? "text-destructive" : "text-muted-foreground"}>{formatINR(c.getValue<number>())}</span> },
      { accessorKey: "lastPayment", header: "Last Payment", cell: (c) => <span className="text-muted-foreground">{c.getValue<string>()}</span> },
      { accessorKey: "status", header: "Status", cell: (c) => <span className={badgeFor(c.getValue<FeeRow["status"]>())}>{c.getValue<string>().replace(/^./, (l) => l.toUpperCase())}</span> },
    ],
    [],
  );

  const bulkActions: BulkAction<FeeRow>[] = [
    { label: "Send Reminder", icon: <MessageSquare className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`Reminder sent to ${r.length} parents`) },
    { label: "Email Statements", icon: <Mail className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`Statements emailed to ${r.length}`) },
    { label: "Export", icon: <Download className="mr-1 h-3.5 w-3.5" />, onClick: (r) => toast.success(`Exported ${r.length} rows`) },
  ];

  const rowActions: RowAction<FeeRow>[] = [
    { label: "Collect Payment", onClick: (r) => setConfirmCollect(r), hidden: (r) => r.pending === 0 },
    { label: "View Receipt", onClick: (r) => setReceipt(r) },
    { label: "Download Statement", onClick: (r) => toast.success(`Statement for ${r.studentName}`) },
  ];

  const exportCsv = (rows: FeeRow[]) => {
    const header = ["Admission No", "Name", "Class", "Total", "Paid", "Pending", "Last Payment", "Status"];
    const body = rows.map((r) => [r.admissionNo, r.studentName, r.class, r.totalFee, r.paid, r.pending, r.lastPayment, r.status]);
    const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "fees.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} fee records`);
  };

  const receiptTimeline: ActivityEvent[] = receipt
    ? [
        { id: "e1", time: receipt.lastPayment !== "-" ? new Date(receipt.lastPayment) : new Date(), user: "Accounts", action: "Payment received", newValue: formatINR(receipt.paid), category: "payment" },
        { id: "e2", time: "2024-07-01", user: "System", action: "Invoice generated", newValue: formatINR(receipt.totalFee), category: "invoice" },
      ]
    : [];

  return (
    <PageLayout
      title="Fee Management"
      description="Track and manage student fee payments"
      breadcrumbs={[{ label: "Finance" }, { label: "Fees" }]}
      actions={
        <>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button className="gap-2"><CreditCard className="h-4 w-4" /> Collect Fee</Button>
        </>
      }
      stats={
        <StatisticsRow>
          <KPI label="Total Collection" value="₹18.5L" sub={<span className="text-success">This month</span>} tone="success" />
          <KPI label="Outstanding" value="₹4.2L" sub="From 245 students" tone="warning" />
          <KPI label="Collection Rate" value="81.5%" sub={<Progress value={81.5} className="mt-2 h-1.5" />} />
          <KPI label="Today's Collection" value="₹85,000" sub="12 payments" tone="primary" />
        </StatisticsRow>
      }
      filters={
        <FilterBar active={active} onClearAll={() => { setStatus(""); setCls(""); }}>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>{["7", "8", "9", "10", "11", "12"].map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      }
    >
      <DataTableV2
        tableId="fees"
        data={data}
        columns={columns}
        searchPlaceholder="Search student, admission no…"
        bulkActions={bulkActions}
        rowActions={rowActions}
        onRowClick={(r) => setReceipt(r)}
        onExportCsv={exportCsv}
        emptyTitle="No fee records"
        stickyFirstColumn
      />

      <AppDrawer
        open={!!receipt}
        onOpenChange={(v) => !v && setReceipt(null)}
        title={receipt ? `Receipt · ${receipt.studentName}` : ""}
        description={receipt ? `${receipt.admissionNo} · Class ${receipt.class}` : undefined}
        size="lg"
        footer={
          receipt && (
            <>
              <Button variant="outline" onClick={() => setReceipt(null)}>Close</Button>
              <Button onClick={() => toast.success("Receipt downloaded")}><Download className="mr-1.5 h-4 w-4" /> Download PDF</Button>
            </>
          )
        }
      >
        {receipt && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Receipt className="h-4 w-4" /> Payment Summary
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div><dt className="text-caption">Total</dt><dd className="mt-0.5 text-lg font-semibold">{formatINR(receipt.totalFee)}</dd></div>
                <div><dt className="text-caption">Paid</dt><dd className="mt-0.5 text-lg font-semibold text-success">{formatINR(receipt.paid)}</dd></div>
                <div><dt className="text-caption">Pending</dt><dd className="mt-0.5 text-lg font-semibold text-destructive">{formatINR(receipt.pending)}</dd></div>
              </dl>
              <Progress value={receipt.totalFee ? (receipt.paid / receipt.totalFee) * 100 : 0} className="mt-4 h-2" />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Payment Timeline</h3>
              <ActivityTimeline events={receiptTimeline} />
            </div>
          </div>
        )}
      </AppDrawer>

      <ConfirmDialog
        open={!!confirmCollect}
        onOpenChange={(v) => !v && setConfirmCollect(null)}
        title="Collect payment?"
        description={confirmCollect ? `Record a payment of ${formatINR(confirmCollect.pending)} for ${confirmCollect.studentName}.` : ""}
        confirmLabel="Record Payment"
        onConfirm={() => {
          const name = confirmCollect?.studentName; setConfirmCollect(null);
          toast.success(`Payment recorded for ${name}`, { action: { label: "Undo", onClick: () => toast.info("Reversed") } });
        }}
      />
    </PageLayout>
  );
}
