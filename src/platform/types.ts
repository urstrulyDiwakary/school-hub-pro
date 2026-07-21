// Platform-level type definitions for the multi-tenant SaaS architecture.
// These types are the source-of-truth contracts that a future backend
// (REST / GraphQL / Supabase) will implement. UI code should depend on
// these types, never on concrete mock shapes.

export type TenantID = string;
export type CampusID = string;
export type AcademicYearID = string;

export type Country = "IN" | "US" | "AE" | "GB" | "SG" | "OTHER";
export type CurrencyCode = "INR" | "USD" | "AED" | "GBP" | "SGD";
export type Board = "CBSE" | "ICSE" | "State" | "IB" | "Cambridge" | "Custom";

export type SubscriptionTier = "starter" | "growth" | "scale" | "enterprise";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

// ---------------------------------------------------------------- Subscription
export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  seats: number;
  seatsUsed: number;
  renewsAt: string; // ISO date
  billingCycle: "monthly" | "annual";
}

// ---------------------------------------------------------------- Branding
export interface BrandingConfig {
  schoolName: string;
  shortName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // HSL string e.g. "231 76% 60%"
  secondaryColor: string;
  fontFamily?: string;
  loginBackgroundUrl?: string;
  footerText?: string;
  emailBrandingHeader?: string;
  receiptBrandingHeader?: string;
  certificateBrandingHeader?: string;
}

// ---------------------------------------------------------------- Feature flags
// Central registry of every optional module. A tenant subscription grants a
// subset. Every UI branch that gates a module MUST consume this system rather
// than checking role or route.
export type FeatureFlag =
  | "transport"
  | "hostel"
  | "library"
  | "payroll"
  | "inventory"
  | "lms"
  | "crm"
  | "hr"
  | "exams"
  | "communication"
  | "reports"
  | "fees"
  | "attendance"
  | "multi_campus"
  | "white_label"
  | "api_access"
  | "sso"
  | "mfa";

export type FeatureFlagMap = Partial<Record<FeatureFlag, boolean>>;

// ---------------------------------------------------------------- Campus
export interface Campus {
  id: CampusID;
  name: string;
  code: string;
  address?: string;
  timezone: string;
  isPrimary?: boolean;
  brandingOverrides?: Partial<BrandingConfig>;
}

// ---------------------------------------------------------------- Academic Year
export type AcademicYearStatus = "current" | "previous" | "archived" | "upcoming";

export interface AcademicYear {
  id: AcademicYearID;
  label: string; // e.g. "2024-25"
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

// ---------------------------------------------------------------- Storage / limits
export interface StorageLimits {
  totalMB: number;
  usedMB: number;
  maxFileMB: number;
}

// ---------------------------------------------------------------- Tenant
export interface Tenant {
  id: TenantID;
  name: string;
  slug: string;
  country: Country;
  currency: CurrencyCode;
  timezone: string;
  board: Board;
  branding: BrandingConfig;
  subscription: Subscription;
  featureFlags: FeatureFlagMap;
  storage: StorageLimits;
  campuses: Campus[];
  academicYears: AcademicYear[];
  createdAt: string;
}

// ---------------------------------------------------------------- Permissions v2
// Action-scoped permission strings following `<resource>.<action>` convention.
export type ActionPermission =
  // Students
  | "students.view" | "students.create" | "students.edit" | "students.delete" | "students.export" | "students.import"
  // Teachers
  | "teachers.view" | "teachers.create" | "teachers.edit" | "teachers.delete" | "teachers.export"
  // Staff
  | "staff.view" | "staff.create" | "staff.edit" | "staff.delete"
  // Fees
  | "fees.view" | "fees.collect" | "fees.refund" | "fees.export" | "fees.configure"
  // Payroll
  | "payroll.view" | "payroll.process" | "payroll.audit" | "payroll.export"
  // Exams
  | "exams.view" | "exams.configure" | "exams.enter_marks" | "exams.publish" | "exams.export"
  // Attendance
  | "attendance.view" | "attendance.mark" | "attendance.export"
  // Communication
  | "communication.view" | "communication.send" | "communication.broadcast"
  // Reports
  | "reports.view" | "reports.download"
  // Settings & platform
  | "settings.view" | "settings.edit"
  | "branding.edit" | "campus.manage" | "subscription.manage" | "users.manage" | "audit.view"
  // Portal
  | "portal.parent" | "portal.student" | "portal.teacher";

// ---------------------------------------------------------------- Audit
export interface AuditEvent {
  id: string;
  timestamp: string;
  tenantId: TenantID;
  campusId?: CampusID;
  academicYearId?: AcademicYearID;
  userId: string;
  userName: string;
  action: string;         // e.g. "students.edit"
  entity: string;         // e.g. "student"
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  device?: string;
  browser?: string;
  ip?: string;
}

// ---------------------------------------------------------------- Notifications
export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp" | "push";
export type NotificationCategory =
  | "system" | "attendance" | "fees" | "payroll"
  | "communication" | "exams" | "approvals" | "announcements";

export interface NotificationMessage {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  channels: NotificationChannel[];
  createdAt: string;
  readAt?: string;
  actorId?: string;
  targetUserId: string;
  link?: string;
}

// ---------------------------------------------------------------- Files
export type FileCategory =
  | "document" | "image" | "certificate" | "receipt" | "homework" | "assignment" | "avatar";

export interface StoredFile {
  id: string;
  tenantId: TenantID;
  category: FileCategory;
  name: string;
  mime: string;
  sizeBytes: number;
  url: string; // signed URL placeholder
  uploadedBy: string;
  uploadedAt: string;
}

// ---------------------------------------------------------------- Import / Export
export type ImportStatus = "pending" | "validating" | "ready" | "processing" | "completed" | "failed";
export interface ImportJob<TRow = Record<string, unknown>> {
  id: string;
  entity: string;
  status: ImportStatus;
  rowsTotal: number;
  rowsValid: number;
  rowsInvalid: number;
  errors: { row: number; column?: string; message: string }[];
  mapping: Record<string, string>; // source col -> target field
  preview: TRow[];
  createdAt: string;
}

export type ExportFormat = "csv" | "pdf" | "xlsx" | "json";
export interface ExportRequest {
  entity: string;
  format: ExportFormat;
  filters?: Record<string, unknown>;
  columns?: string[];
  templateId?: string;
}
