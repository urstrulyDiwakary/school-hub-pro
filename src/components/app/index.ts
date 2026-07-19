// Enterprise application framework — single import surface.
// See src/components/app/README.md for usage guidance.

// Page shell
export { PageLayout } from "./page/PageLayout";
export { ContentSection } from "./page/ContentSection";
export { StatisticsRow } from "./page/StatisticsRow";
export { Toolbar } from "./page/Toolbar";
export { FilterBar, type ActiveFilter } from "./page/FilterBar";

// Feedback
export { EmptyState } from "./feedback/EmptyState";
export { ErrorState } from "./feedback/ErrorState";
export {
  RowSkeleton,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  Shimmer,
} from "./feedback/Skeletons";

// Overlays
export { AppDrawer } from "./overlays/AppDrawer";
export { ConfirmDialog, DeleteDialog } from "./overlays/ConfirmDialog";

// Security
export { Can, PermissionButton, PermissionMenuItem } from "./security/Can";
export { MaskedField } from "./security/MaskedField";
export { SessionTimeoutWarning } from "./security/SessionTimeoutWarning";

// Forms
export { FormShell, FormSection, FormStepper } from "./forms/FormShell";
export { useAutoSave, useDirtyGuard } from "./forms/hooks";

// Entity profile
export { EntityProfileLayout, type EntityTab } from "./entity/EntityProfileLayout";

// Activity
export { ActivityTimeline, type ActivityEvent } from "./activity/ActivityTimeline";

// Data table
export { DataTableV2, type BulkAction, type RowAction } from "../data-table/DataTableV2";
export { useSavedViews, type SavedView } from "../data-table/useSavedViews";
