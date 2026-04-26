import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ShieldAlert, Download } from "lucide-react";
import { auditLogStore, type ExportAuditEntry } from "@/lib/exportAuditLog";
import { resolveEffectivePermissions, type UserRole } from "@/lib/userRole";
import { toast } from "sonner";

const FORMAT_LABEL: Record<ExportAuditEntry["format"], string> = {
  csv: "CSV",
  pdf: "PDF",
  htmlFallback: "HTML fallback",
};

export default function ExportAuditLog() {
  const { effectiveRole } = resolveEffectivePermissions();
  const isAdmin = effectiveRole === "admin";

  const [entries, setEntries] = useState<ExportAuditEntry[]>(() => auditLogStore.list());
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | ExportAuditEntry["format"]>("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => auditLogStore.subscribe(() => setEntries(auditLogStore.list())), []);

  if (!isAdmin) {
    return (
      <main className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Admin only
            </CardTitle>
            <CardDescription>
              The export audit log is restricted to admin users. Switch to an admin route to view it.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const filtered = entries.filter((e) => {
    if (roleFilter !== "all" && e.role !== roleFilter) return false;
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    if (fromDate && e.timestamp < `${fromDate}T00:00:00.000Z`) return false;
    if (toDate && e.timestamp > `${toDate}T23:59:59.999Z`) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.studentName.toLowerCase().includes(q) &&
        !e.studentId.toLowerCase().includes(q) &&
        !e.route.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSearch(""); setRoleFilter("all"); setFormatFilter("all"); setFromDate(""); setToDate("");
  };

  const handleClear = () => {
    auditLogStore.clear();
    toast.success("Audit log cleared");
  };

  const handleExport = () => {
    const header = "Timestamp,Role,Route,Format,Fallback,StudentId,StudentName\n";
    const rows = filtered.map((e) =>
      [
        e.timestamp,
        e.role,
        e.route,
        e.format,
        e.fallback ? "yes" : "no",
        e.studentId,
        `"${e.studentName.replace(/"/g, '""')}"`,
      ].join(","),
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-audit-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto max-w-6xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Export Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Every CSV, PDF, and HTML fallback export from the Student Detail modal is recorded here
          with the role, route, student, and timestamp. Newest first.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Recent exports</CardTitle>
            <CardDescription>{filtered.length} entries shown of {entries.length} total</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={entries.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Search student, ID, or route…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as typeof formatFilter)}>
              <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="htmlFallback">HTML fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No exports recorded.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(parseISO(e.timestamp), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{e.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{FORMAT_LABEL[e.format]}</span>
                      {e.fallback && (
                        <Badge variant="outline" className="ml-2 text-xs">fallback</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{e.studentName}</div>
                      <div className="text-xs text-muted-foreground">Roll {e.studentId}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{e.route}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
