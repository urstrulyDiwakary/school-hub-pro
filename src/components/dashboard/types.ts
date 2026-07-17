import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Widget size on the 12-column dashboard grid.
 * Values map to Tailwind col-span classes in DashboardGrid.
 */
export type WidgetSize = "sm" | "md" | "lg" | "xl" | "full";

/** Semantic tone used by cards, alerts, and stats. */
export type Tone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";

export type TrendDirection = "up" | "down" | "neutral";

export interface WidgetState {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRefresh?: () => void;
  expandable?: boolean;
  size?: WidgetSize;
}

export interface DashboardAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  to?: string;
  onClick?: () => void;
  tone?: Tone;
  /** Future: permission key checked against role/RBAC. */
  permission?: string;
  description?: string;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
  time?: string;
  actionLabel?: string;
  onAction?: () => void;
  to?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: LucideIcon;
  tone?: Tone;
}

export interface TaskItem {
  id: string;
  title: string;
  meta?: string;
  due?: string;
  tone?: Tone;
  done?: boolean;
  onToggle?: (id: string) => void;
}

export interface ApprovalItem {
  id: string;
  title: string;
  requester: string;
  meta?: string;
  time?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO
  title: string;
  tone?: Tone;
  meta?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  time: string;
  unread?: boolean;
  tone?: Tone;
}

export interface SparkPoint {
  x: string | number;
  y: number;
}

/**
 * Widget descriptor — used by future personalization layer
 * (drag-and-drop, hide/show, pin, resize). Not persisted yet.
 */
export interface WidgetDescriptor {
  id: string;
  title: string;
  size: WidgetSize;
  hidden?: boolean;
  pinned?: boolean;
  render: () => ReactNode;
}
