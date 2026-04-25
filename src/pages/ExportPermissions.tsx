import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, FileSpreadsheet, FileText, FileCode2, Settings, ScrollText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { exportPermissions, resolveEffectivePermissions, type UserRole } from "@/lib/userRole";
import { exportConfigStore, type ExportFormat } from "@/lib/exportConfig";

interface FormatRow {
  key: ExportFormat;
  label: string;
  description: string;
  Icon: typeof FileSpreadsheet;
}

const FORMATS: FormatRow[] = [
  { key: "csv", label: "CSV", description: "Raw spreadsheet export of attendance and remarks. Useful for downstream analysis.", Icon: FileSpreadsheet },
  { key: "pdf", label: "PDF", description: "Formatted report generated in-app via jsPDF. Direct download, no pop-ups.", Icon: FileText },
  { key: "htmlFallback", label: "HTML fallback", description: "Automatic safety net used when PDF generation fails at runtime.", Icon: FileCode2 },
];

const ROLES: UserRole[] = ["admin", "teacher"];
const ROLE_BLURBS: Record<UserRole, string> = {
  admin: "Full export access. Can pull raw spreadsheets and formatted reports.",
  teacher: "Restricted to formatted reports. CSV is admin-only to keep raw data scoped.",
};

// Guard source — the exact lines that enforce each format restriction. Cells
// link to these so reviewers can audit the matrix against the implementation.
const GUARD_SOURCE: Record<ExportFormat, { file: string; symbol: string; lines: string; explainer: string }> = {
  csv: {
    file: "src/lib/userRole.ts",
    symbol: "resolveEffectivePermissions",
    lines: "L80-L102",
    explainer:
      "CSV access is the intersection of (a) school config for the prop role, (b) school config for the route role. The stricter side wins, so /teacher/* always blocks CSV.",
  },
  pdf: {
    file: "src/lib/userRole.ts",
    symbol: "resolveEffectivePermissions",
    lines: "L80-L102",
    explainer:
      "PDF access uses the same intersection. PDF is enabled for both roles by default; the route guard still prevents bypassing the school config.",
  },
  htmlFallback: {
    file: "src/components/teacher/student-detail/StudentExportActions.tsx",
    symbol: "exportPDF (catch branch)",
    lines: "L202-L215",
    explainer:
      "HTML fallback fires automatically inside the PDF catch block. It inherits the PDF permission and is recorded in the audit log with fallback=true.",
  },
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

interface CellDetail {
  format: ExportFormat;
  role: UserRole;
}

export default function ExportPermissions() {
  // Live config so the matrix reflects per-school overrides immediately.
  const [config, setConfig] = useState(() => exportConfigStore.get());
  useEffect(() => exportConfigStore.subscribe(() => setConfig(exportConfigStore.get())), []);

  const [detail, setDetail] = useState<CellDetail | null>(null);

  // Effective permissions for the CURRENT route (no prop role override).
  const effective = resolveEffectivePermissions();

  return (
    <main className="container mx-auto max-w-5xl space-y-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Export Permission Matrix</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Which export formats each role can generate. Click any cell to see the exact
            guard that enforces it. Permissions are intersected with the role detected
            from the current route.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/settings/export-config">
              <Settings className="mr-2 h-4 w-4" /> Configure
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/settings/export-audit">
              <ScrollText className="mr-2 h-4 w-4" /> Audit log
            </Link>
          </Button>
        </div>
      </header>

      {/* Effective permissions for THIS route */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Effective permissions on this route</CardTitle>
          <CardDescription>
            Computed live from <code className="font-mono text-xs">resolveEffectivePermissions()</code>{" "}
            using the current path <code className="font-mono text-xs">{typeof window !== "undefined" ? window.location.pathname : "/"}</code>
            {" "}→ route role <Badge variant="secondary" className="ml-1 capitalize">{effective.routeRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {FORMATS.map(({ key, label, Icon }) => (
              <div key={key} className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <PermissionCell allowed={effective[key]} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Default format for this role: <strong className="capitalize">{effective.defaultFormat}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Matrix — cells are buttons that open the guard detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format access by role</CardTitle>
          <CardDescription>
            Click a cell to inspect the guard that enforces it. A blocked format is hidden from the export dropdown.
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
                      <button
                        type="button"
                        onClick={() => setDetail({ format: key, role: r })}
                        className="rounded px-2 py-1 -mx-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Inspect ${label} guard for ${r}`}
                      >
                        <PermissionCell allowed={config.enabled[r][key]} />
                      </button>
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
          const perms = config.enabled[r];
          const hardcoded = exportPermissions[r];
          const overridden = (Object.keys(perms) as ExportFormat[]).some((k) => perms[k] !== hardcoded[k]);
          return (
            <Card key={r}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base capitalize">
                  {r}
                  <div className="flex gap-1">
                    {overridden && <Badge variant="outline" className="text-xs">school override</Badge>}
                    <Badge variant="secondary" className="capitalize">{r}</Badge>
                  </div>
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

      {/* Guard detail sheet */}
      <Sheet open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          {detail && (() => {
            const guard = GUARD_SOURCE[detail.format];
            const allowed = config.enabled[detail.role][detail.format];
            const fmtLabel = FORMATS.find((f) => f.key === detail.format)?.label ?? detail.format;
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {fmtLabel} <span className="text-muted-foreground">·</span>
                    <span className="capitalize">{detail.role}</span>
                  </SheetTitle>
                  <SheetDescription>
                    Status: <PermissionCell allowed={allowed} />
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Guard source</div>
                    <div className="mt-1 font-mono text-xs break-all">
                      {guard.file}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">{guard.symbol}</span> · {guard.lines}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">How it's enforced</div>
                    <p className="mt-1 leading-relaxed">{guard.explainer}</p>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3 text-xs">
                    <div className="font-medium mb-1">Effective for current route</div>
                    <div className="flex items-center justify-between">
                      <span>{fmtLabel} on <code className="font-mono">{typeof window !== "undefined" ? window.location.pathname : "/"}</code></span>
                      <PermissionCell allowed={effective[detail.format]} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/settings/export-config">
                        <Settings className="mr-2 h-4 w-4" /> Change config
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/settings/export-audit">
                        <ExternalLink className="mr-2 h-4 w-4" /> View audits
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </main>
  );
}
