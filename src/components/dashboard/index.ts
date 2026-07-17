/**
 * Reusable dashboard framework.
 * Import from `@/components/dashboard` in any portal to compose
 * a consistent, responsive, permission-ready dashboard.
 */
export * from "./types";
export * from "./tone";
export { WidgetCard } from "./WidgetCard";
export { DashboardShell, DashboardGrid } from "./DashboardShell";
export { StatCardV2 } from "./StatCardV2";
export { TrendCard } from "./TrendCard";
export { InsightCard } from "./InsightCard";
export { AlertCard } from "./AlertCard";
export { ActivityFeed } from "./ActivityFeed";
export { TaskQueue } from "./TaskQueue";
export { ApprovalQueue } from "./ApprovalQueue";
export { CalendarWidget, UpcomingEventsCard } from "./CalendarWidget";
export { KPIGrid } from "./KPIGrid";
export { ChartCard } from "./ChartCard";
export { QuickActionsPanel } from "./QuickActionsPanel";
export { NotificationPanel } from "./NotificationPanel";
export { EmptyDashboardState } from "./EmptyDashboardState";
