import { CheckCircle2, XCircle, FileSpreadsheet, FileText, FileCode2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportPermissions, type UserRole } from "@/lib/userRole";

interface FormatRow {
  key: "csv" | "pdf" | "htmlFallback";
  label: string;
  description: string;
  Icon: typeof FileSpreadsheet;
}

const FORMATS: FormatRow[] = [
  {
    key: "csv",
    label: "CSV",
    description: "Raw spreadsheet export of attendance and remarks. Useful for downstream analysis.",
    Icon: FileSpreadsheet,
  },
  {
    key: "pdf",
    label: "PDF",
    description: "Formatted report generated in-app via jsPDF. Direct download, no pop-ups.",
    Icon: FileText,
  },
  {
    key: "htmlFallback",
    label: "HTML fallback",
    description: "Automatic safety net used when PDF generation fails at runtime.",
    Icon: FileCode2,
  },
];

const ROLES: UserRole[] = ["admin", "teacher"];

const ROLE_BLURBS: Record<UserRole, string> = {
  admin: "Full export access. Can pull raw spreadsheets and formatted reports.",
  teacher: "Restricted to formatted reports. CSV is admin-only to keep raw data scoped.",
};

function PermissionCell({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <span className="inline-flex items-center gap-1.5 text-success">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">Allowed</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <XCircle className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm">Blocked</span>
    </span>
  );
}

export default function ExportPermissions() {
  return (
    <main className="container mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Export Permission Matrix</h1>
        <p className="text-sm text-muted-foreground">
          Which export formats each role can generate from the Student Detail modal.
          Permissions are enforced both at render time and at click time, and intersected
          with the role detected from the current route.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format access by role</CardTitle>
          <CardDescription>
            A blocked format is hidden from the export dropdown for that role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Format</TableHead>
                {ROLES.map((r) => (
                  <TableHead key={r} className="capitalize">{r}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FORMATS.map(({ key, label, description, Icon }) => (
                <TableRow key={key}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </div>
                  </TableCell>
                  {ROLES.map((r) => (
                    <TableCell key={r}>
                      <PermissionCell allowed={exportPermissions[r][key]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES.map((r) => {
          const perms = exportPermissions[r];
          return (
            <Card key={r}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base capitalize">
                  {r}
                  <Badge variant="secondary" className="capitalize">{r}</Badge>
                </CardTitle>
                <CardDescription>{ROLE_BLURBS[r]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {FORMATS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span>{label}</span>
                    <PermissionCell allowed={perms[key]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How the guard works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            The export dropdown calls <code className="font-mono text-xs">resolveEffectivePermissions(role)</code>,
            which intersects the role passed via props with the role detected from the
            current route (<code className="font-mono text-xs">/teacher</code> vs everything else).
          </p>
          <p>
            The stricter side wins: a teacher route can never expose CSV, even if a parent
            component passes <code className="font-mono text-xs">role="admin"</code>. A second
            check at click time prevents stale state from bypassing the guard.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
