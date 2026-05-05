import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { RotateCcw, Save, ShieldAlert } from "lucide-react";
import {
  exportConfigStore,
  DEFAULT_SCHOOL_EXPORT_CONFIG,
  type SchoolExportConfig,
  type ExportFormat,
} from "@/lib/exportConfig";
import { exportSettingsStore, DEFAULT_EXPORT_SETTINGS, type ExportSettings } from "@/lib/exportSettings";
import { exportJobQueue } from "@/lib/exportJobQueue";
import { resolveEffectivePermissions, type UserRole } from "@/lib/userRole";

const ROLES: UserRole[] = ["admin", "teacher"];
const FORMATS: { key: ExportFormat; label: string; description: string }[] = [
  { key: "csv", label: "CSV", description: "Raw spreadsheet export" },
  { key: "pdf", label: "PDF", description: "In-app jsPDF report (direct download)" },
  { key: "htmlFallback", label: "HTML fallback", description: "Used automatically when PDF fails" },
];

export default function ExportConfig() {
  const { effectiveRole } = resolveEffectivePermissions();
  const isAdmin = effectiveRole === "admin";

  const [draft, setDraft] = useState<SchoolExportConfig>(() => exportConfigStore.get());
  const [dirty, setDirty] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>(() => exportSettingsStore.get());
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => exportConfigStore.subscribe(() => {
    if (!dirty) setDraft(exportConfigStore.get());
  }), [dirty]);

  useEffect(() => exportSettingsStore.subscribe(() => {
    if (!settingsDirty) setSettings(exportSettingsStore.get());
  }), [settingsDirty]);

  if (!isAdmin) {
    return (
      <main className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Admin only
            </CardTitle>
            <CardDescription>Only admin users can change export configuration.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const updateEnabled = (role: UserRole, fmt: ExportFormat, value: boolean) => {
    setDraft((d) => ({
      ...d,
      enabled: { ...d.enabled, [role]: { ...d.enabled[role], [fmt]: value } },
    }));
    setDirty(true);
  };

  const updateDefault = (role: UserRole, fmt: ExportFormat) => {
    setDraft((d) => ({ ...d, defaultFormat: { ...d.defaultFormat, [role]: fmt } }));
    setDirty(true);
  };

  const handleSave = () => {
    exportConfigStore.set(draft);
    setDirty(false);
    toast.success("Export configuration saved");
  };

  const handleReset = () => {
    setDraft(DEFAULT_SCHOOL_EXPORT_CONFIG);
    setDirty(true);
  };

  return (
    <main className="container mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Export Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Control which export formats each role can use and which format is pre-selected.
          These settings <strong>override</strong> the hardcoded defaults but are still
          intersected with the route guard, so a teacher route can never expose CSV.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {ROLES.map((role) => {
          const allowed = FORMATS.filter((f) => draft.enabled[role][f.key]);
          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="capitalize text-base">{role}</CardTitle>
                <CardDescription>
                  Toggle availability and pick the default format for {role} users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {FORMATS.map((f) => (
                    <div key={f.key} className="flex items-start justify-between gap-3">
                      <div>
                        <Label htmlFor={`${role}-${f.key}`} className="text-sm font-medium">
                          {f.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                      <Switch
                        id={`${role}-${f.key}`}
                        checked={draft.enabled[role][f.key]}
                        onCheckedChange={(v) => updateEnabled(role, f.key, v)}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Default format</Label>
                  <Select
                    value={draft.defaultFormat[role]}
                    onValueChange={(v) => updateDefault(role, v as ExportFormat)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem
                          key={f.key}
                          value={f.key}
                          disabled={!draft.enabled[role][f.key]}
                        >
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {allowed.length === 0 && (
                    <p className="text-xs text-destructive">
                      No formats are enabled — {role} users will not see the export menu.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job retry behavior</CardTitle>
          <CardDescription>
            Controls how many times a failed export job is automatically retried
            using exponential backoff before giving up. Applies to all roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 max-w-[160px]">
              <Label htmlFor="max-retries" className="text-sm font-medium">
                Default max retries
              </Label>
              <Input
                id="max-retries"
                type="number"
                inputMode="numeric"
                min={0}
                max={10}
                value={settings.defaultMaxRetries}
                onChange={(e) => {
                  const n = Math.max(0, Math.min(10, Math.floor(Number(e.target.value) || 0)));
                  setSettings({ ...settings, defaultMaxRetries: n });
                  setSettingsDirty(true);
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                0 disables auto-retry. Recommended: 2–5.
              </p>
            </div>
            <div className="space-y-1.5 max-w-[180px]">
              <Label htmlFor="max-concurrent-retries" className="text-sm font-medium">
                Max concurrent auto-retries
              </Label>
              <Input
                id="max-concurrent-retries"
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={settings.maxConcurrentAutoRetries}
                onChange={(e) => {
                  const n = Math.max(0, Math.min(20, Math.floor(Number(e.target.value) || 0)));
                  setSettings({ ...settings, maxConcurrentAutoRetries: n });
                  setSettingsDirty(true);
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Global fallback. Caps simultaneous backoff timers across all kinds. 0 = no cap.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings(DEFAULT_EXPORT_SETTINGS);
                  setSettingsDirty(true);
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                disabled={!settingsDirty}
                onClick={() => {
                  exportSettingsStore.set(settings);
                  setSettingsDirty(false);
                  toast.success("Retry settings saved");
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Per-format auto-retry caps</p>
            <p className="text-[11px] text-muted-foreground">
              Override the global cap for specific export formats. Leave blank to inherit
              the global value above. Useful when, e.g., combined PDFs are heavier and
              should retry one at a time.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
              {(["csv", "pdf", "htmlFallback", "combined-pdf"] as const).map((kind) => {
                const KIND_LABELS: Record<typeof kind, string> = {
                  csv: "CSV",
                  pdf: "PDF",
                  htmlFallback: "HTML",
                  "combined-pdf": "Combined PDF",
                };
                const value = settings.maxConcurrentAutoRetriesByKind?.[kind];
                return (
                  <div key={kind} className="space-y-1">
                    <Label htmlFor={`mc-${kind}`} className="text-xs font-medium">
                      {KIND_LABELS[kind]}
                    </Label>
                    <Input
                      id={`mc-${kind}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={20}
                      placeholder="—"
                      value={value ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const byKind = { ...(settings.maxConcurrentAutoRetriesByKind ?? {}) };
                        if (raw === "") {
                          delete byKind[kind];
                        } else {
                          const n = Math.max(0, Math.min(20, Math.floor(Number(raw) || 0)));
                          byKind[kind] = n;
                        }
                        setSettings({ ...settings, maxConcurrentAutoRetriesByKind: byKind });
                        setSettingsDirty(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Persisted failed export history</p>
              <p className="text-[11px] text-muted-foreground">
                Failed jobs are remembered across page reloads so users can copy errors for support.
                Clearing wipes the local history on this device.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportJobQueue.clearPersistedFailedHistory();
                toast.success("Failed export history cleared");
              }}
            >
              Clear history
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to defaults
        </Button>
        <Button onClick={handleSave} disabled={!dirty}>
          <Save className="mr-2 h-4 w-4" />
          Save changes
        </Button>
      </div>
    </main>
  );
}
