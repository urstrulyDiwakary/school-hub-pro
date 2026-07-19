
# Phase 3 — Enterprise Application Framework

This phase builds the shared UI foundation for all 80+ pages. No routes change, no business logic is removed, and existing pages keep working until they're migrated.

## Scope split

Phase 3 is intentionally split into two waves so we ship a stable framework before touching real pages.

### Wave A — Framework primitives (this batch)

Build the reusable library under `src/components/app/` and `src/components/data-table/`. Every primitive is generic, token-driven (uses semantic HSL tokens from `index.css`), dark-mode ready, responsive, keyboard-accessible.

**Page shell** — `src/components/app/page/`
- `PageLayout`, `PageHeader`, `PageDescription`, `PageActions`, `Breadcrumb`
- `FilterBar`, `Toolbar`, `StatisticsRow`, `ContentSection`, `EmptySection`, `StickyActionBar`

**Data table** — `src/components/data-table/`
- `DataTableV2` built on TanStack Table v8 (headless, already fits shadcn patterns)
- Features: sticky header + first column, resize/reorder/visibility, saved views (localStorage), search, sort, multi-select, bulk actions, pagination, keyboard nav, row context menu, skeleton/empty/error, permission-aware actions, responsive card mode
- Virtualization via `@tanstack/react-virtual` (opt-in prop; off by default to keep small tables lightweight)
- Export hooks: `onExportCsv`, `onExportPdf` (consumer supplies the generator so we don't duplicate existing export pipeline)

**Filter framework** — `src/components/app/filters/`
- `FilterField` primitives: date range, select, multi-select, async-select (students/teachers/classes/sections/campus/academic-year/status)
- `FilterPresets` (saved presets in localStorage, per-page key)
- `FiltersProvider` context so `FilterBar`, `DataTableV2`, and URL sync share state

**Global search** — extend existing `CommandPalette`
- Add pluggable `searchProviders` registry (students, teachers, parents, fees, receipts, payroll, exams, homework, settings, navigation)
- Recent, pinned, grouped results; keyboard nav already there

**Form framework** — `src/components/app/forms/`
- `FormShell` (react-hook-form + zod), `FormSection` (collapsible), `FormStepper`, `FormProgress`
- `useAutoSave` (debounced draft to localStorage), `useDirtyGuard` (unsaved-changes prompt), `AutoSuggestField`

**Entity profile framework** — `src/components/app/entity/`
- `EntityProfileLayout` with slots: summary header, action bar, tabs (Overview / Timeline / Documents / Activity / Audit / Notes / Attachments / Communication)
- Composed from smaller primitives so entities can opt-in per tab

**Activity + Approval** — `src/components/app/activity/`, `src/components/app/approval/`
- `ActivityTimeline` (time, user, action, old→new, device/IP, filters, search, pagination)
- `ApprovalQueue` reusing existing dashboard primitive; add `ApprovalDetail` view with comments/timeline

**Drawers + modals** — `src/components/app/overlays/`
- `AppDrawer` (sm/md/lg/fullscreen) wrapping Radix Sheet
- `ConfirmDialog`, `DeleteDialog`, `PreviewDialog`, `FormDialog`, `WizardDialog`, `ImageLightbox`, `DocumentViewer`

**Feedback states**
- `Skeleton` variants (row, card, table, chart) + `Shimmer` util
- `EmptyState` (illustration slot, title, body, primary/secondary CTA)
- `ErrorState` (retry, support link, collapsible technical details)

**Security primitives** — `src/components/app/security/`
- `<Can permission=...>` wrapper, `PermissionButton`, `PermissionMenuItem`
- `MaskedField` (reveal on demand, audit hook)
- `SessionTimeoutWarning` (idle detection + countdown)

**Tokens pass**
- Audit `index.css` and `tailwind.config.ts`; add missing spacing/radius/elevation/animation tokens; document usage in a short `src/components/app/README.md`

### Wave B — Reference migrations

Refactor three representative pages to prove the framework, keeping business logic intact:
1. **Students** (`/students`) — list page with `DataTableV2`, `FilterBar`, saved views, bulk actions, row drawer preview
2. **Teachers** (`/teachers`) — same list pattern + entity profile drawer
3. **Fees** (`/fees`) — list + `StatisticsRow` + bulk receipt actions + entity profile

All other pages remain untouched and continue to work; a follow-up phase migrates them incrementally.

## Explicitly out of scope for Phase 3

- Migrating remaining 80+ pages (planned as incremental follow-ups)
- Real backend/API wiring (framework stays mock-compatible)
- Building new dashboards (Phase 2 already covered that)
- Changing routes, permissions matrix, or business rules

## Technical notes

- New dependencies: `@tanstack/react-table`, `@tanstack/react-virtual` (both small, tree-shakable, MIT). Existing `react-hook-form`, `zod`, `zustand` are already installed.
- Persistence for saved views/filters/drafts uses `localStorage` keyed by page + user role.
- All primitives export from `src/components/app/index.ts` for a single import surface.
- Existing components (`PageHeader`, `CommandPalette`, dashboard primitives) are extended, not replaced, to avoid breakage.

## Deliverables checklist

```text
src/components/app/
  page/           PageLayout, PageHeader, FilterBar, Toolbar, ...
  filters/        FilterField, FilterPresets, FiltersProvider
  forms/          FormShell, FormSection, useAutoSave, useDirtyGuard
  entity/         EntityProfileLayout + tab primitives
  activity/       ActivityTimeline
  approval/       ApprovalDetail
  overlays/       AppDrawer, ConfirmDialog, ...
  feedback/       Skeleton, EmptyState, ErrorState
  security/       Can, PermissionButton, MaskedField, SessionTimeoutWarning
  index.ts

src/components/data-table/
  DataTableV2.tsx and supporting hooks (useColumnState, useSavedViews, ...)

Refactored pages:
  src/pages/Students.tsx
  src/pages/Teachers.tsx
  src/pages/Fees.tsx
```

Given the size, I'll ship Wave A in this turn and pause for your review before starting Wave B migrations — that way you can sanity-check the API surface before three real pages depend on it.

Proceed?
