# EduTrack Pro — Enterprise Application Framework

Reusable primitives that every page in the app composes from. **Do not build
one-off page layouts, tables, drawers, or forms.** Compose the primitives
below instead — they guarantee identical spacing, dark-mode behavior,
accessibility, and interaction patterns across all portals.

## Import surface

```ts
import {
  // Page shell
  PageLayout, ContentSection, StatisticsRow, Toolbar, FilterBar,
  // Feedback
  EmptyState, ErrorState, TableSkeleton, CardSkeleton, ChartSkeleton,
  // Overlays
  AppDrawer, ConfirmDialog, DeleteDialog,
  // Security
  Can, PermissionButton, PermissionMenuItem, MaskedField, SessionTimeoutWarning,
  // Forms
  FormShell, FormSection, FormStepper, useAutoSave, useDirtyGuard,
  // Entity
  EntityProfileLayout,
  // Activity
  ActivityTimeline,
  // Data table
  DataTableV2, useSavedViews,
} from "@/components/app";
```

## Design tokens

All primitives read from semantic HSL tokens in `src/index.css`. **Never
hardcode colors** (`text-white`, `bg-[#xxx]`, `bg-gray-500`). Use tokens:
`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`border-border`, `text-primary`, `bg-primary`, etc.

## List-page recipe

```tsx
<PageLayout
  title="Students"
  description="Manage all enrolled students."
  breadcrumbs={[{ label: "Academics", href: "/academics" }, { label: "Students" }]}
  actions={<Button>Add student</Button>}
  stats={<StatisticsRow>...</StatisticsRow>}
  filters={<FilterBar active={active} onClearAll={clear}>...</FilterBar>}
>
  <DataTableV2
    tableId="students"
    data={students}
    columns={columns}
    bulkActions={[{ label: "Export", onClick: ... }]}
    rowActions={[{ label: "View", onClick: ... }]}
    onRowClick={(s) => setSelected(s)}
    onExportCsv={exportCsv}
  />
  <AppDrawer open={!!selected} onOpenChange={() => setSelected(null)} size="lg">
    <EntityProfileLayout summary={...} tabs={...} />
  </AppDrawer>
</PageLayout>
```

## Migration guidance

Existing pages continue to work. When migrating, replace:

- `PortalPage` / bespoke headers → `PageLayout`
- Hand-rolled tables → `DataTableV2` (persists column state via `tableId`)
- Full-page detail views for previews → `AppDrawer` + `EntityProfileLayout`
- Custom empty/error/loading blocks → `EmptyState` / `ErrorState` / `*Skeleton`
- Inline permission checks → `<Can>` / `PermissionButton`
