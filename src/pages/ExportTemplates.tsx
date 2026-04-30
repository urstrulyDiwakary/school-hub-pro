import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { RotateCcw, Save, ShieldAlert, Sparkles } from "lucide-react";
import {
  exportTemplatesStore,
  DEFAULT_EXPORT_TEMPLATES,
  type ExportTemplates,
  type ExportTemplate,
  type IdentityField,
  type AttendanceColumn,
  type ReportSection,
} from "@/lib/exportTemplates";
import { EXPORT_PRESETS } from "@/lib/exportPresets";
import { resolveEffectivePermissions } from "@/lib/userRole";

type FormatKey = "csv" | "pdf" | "htmlFallback";

const FORMAT_LABEL: Record<FormatKey, string> = {
  csv: "CSV",
  pdf: "PDF",
  htmlFallback: "HTML",
};

const IDENTITY_FIELDS: { key: IdentityField; label: string; description: string }[] = [
  { key: "name", label: "Student name", description: "Shown in report header / CSV meta" },
  { key: "rollNo", label: "Roll number", description: "Class roll number" },
  { key: "admissionNo", label: "Admission number", description: "Permanent admission ID" },
  { key: "class", label: "Class & section", description: "Current class assignment" },
];

const COLUMN_FIELDS: { key: AttendanceColumn; label: string; description: string }[] = [
  { key: "date", label: "Date", description: "ISO date column (required by most analytics)" },
  { key: "status", label: "Status", description: "Present / Absent / Late" },
  { key: "remarks", label: "Daily remarks", description: "Joins matching remarks into the row" },
];

const SECTION_FIELDS: { key: ReportSection; label: string; description: string }[] = [
  { key: "stats", label: "Stats summary", description: "Rate, present, absent, late, total" },
  { key: "daily", label: "Daily attendance table", description: "The per-day rows" },
  { key: "remarks", label: "Teacher remarks", description: "List of dated remarks with tags" },
];

function TemplateEditor({
  format,
  template,
  onChange,
}: {
  format: FormatKey;
  template: ExportTemplate;
  onChange: (next: ExportTemplate) => void;
}) {
  const update = <K extends keyof ExportTemplate>(group: K, key: keyof ExportTemplate[K], value: boolean) => {
    onChange({ ...template, [group]: { ...template[group], [key]: value } });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-sm font-semibold">Quick presets</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Apply a curated configuration to {FORMAT_LABEL[format]}, then fine-tune below.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {EXPORT_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              title={preset.description}
              onClick={() => onChange(preset.build())}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Identity fields</h3>
          <p className="text-xs text-muted-foreground">
            Which student identifiers appear in the {FORMAT_LABEL[format]} header.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {IDENTITY_FIELDS.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <Label htmlFor={`${format}-id-${f.key}`} className="text-sm font-medium">{f.label}</Label>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch
                id={`${format}-id-${f.key}`}
                checked={template.identity[f.key]}
                onCheckedChange={(v) => update("identity", f.key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Attendance columns</h3>
          <p className="text-xs text-muted-foreground">
            Columns rendered in the daily attendance table.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {COLUMN_FIELDS.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <Label htmlFor={`${format}-col-${f.key}`} className="text-sm font-medium">{f.label}</Label>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch
                id={`${format}-col-${f.key}`}
                checked={template.attendanceColumns[f.key]}
                onCheckedChange={(v) => update("attendanceColumns", f.key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Report sections</h3>
          <p className="text-xs text-muted-foreground">
            Toggle whole sections in the {FORMAT_LABEL[format]} document.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SECTION_FIELDS.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <Label htmlFor={`${format}-sec-${f.key}`} className="text-sm font-medium">{f.label}</Label>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch
                id={`${format}-sec-${f.key}`}
                checked={template.sections[f.key]}
                onCheckedChange={(v) => update("sections", f.key, v)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ExportTemplates() {
  const { effectiveRole } = resolveEffectivePermissions();
  const isAdmin = effectiveRole === "admin";

  const [draft, setDraft] = useState<ExportTemplates>(() => exportTemplatesStore.get());
  const [dirty, setDirty] = useState(false);

  useEffect(() => exportTemplatesStore.subscribe(() => {
    if (!dirty) setDraft(exportTemplatesStore.get());
  }), [dirty]);

  if (!isAdmin) {
    return (
      <main className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Admin only
            </CardTitle>
            <CardDescription>Only admin users can change export templates.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const updateTemplate = (key: FormatKey, t: ExportTemplate) => {
    setDraft((d) => ({ ...d, [key]: t }));
    setDirty(true);
  };

  const handleSave = () => {
    exportTemplatesStore.set(draft);
    setDirty(false);
    toast.success("Export templates saved");
  };

  const handleReset = () => {
    setDraft(DEFAULT_EXPORT_TEMPLATES);
    setDirty(true);
  };

  return (
    <main className="container mx-auto max-w-5xl space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Export Templates</h1>
        <p className="text-sm text-muted-foreground">
          Control which fields, columns and sections appear in CSV, PDF and HTML
          exports. Each format is configured independently — for example, CSV
          can omit identity headers while PDF keeps the full title block.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-format configuration</CardTitle>
          <CardDescription>
            Switch tabs to edit each format. Changes apply to all future exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="csv">
            <TabsList>
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="htmlFallback">HTML</TabsTrigger>
            </TabsList>
            {(["csv", "pdf", "htmlFallback"] as FormatKey[]).map((k) => (
              <TabsContent key={k} value={k} className="pt-4">
                <TemplateEditor
                  format={k}
                  template={draft[k]}
                  onChange={(next) => updateTemplate(k, next)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to defaults
        </Button>
        <Button onClick={handleSave} disabled={!dirty}>
          <Save className="mr-2 h-4 w-4" />
          Save templates
        </Button>
      </div>
    </main>
  );
}
