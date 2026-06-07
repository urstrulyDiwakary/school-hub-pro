// Permission matrix for EduTrack Pro.
//
// Two complementary layers:
//   1. `permissions` — granular capability flags used by UI/analytics.
//   2. `allowedRoutePrefixes` — route-segment access used by the route guard.
//
// Keeping both in one place makes the access model auditable and testable.

import type { Role } from "./types";

export type Permission =
  | "view:admin_dashboard"
  | "manage:students"
  | "manage:teachers"
  | "manage:staff"
  | "manage:academics"
  | "manage:fees"
  | "view:fees"
  | "manage:payroll"
  | "view:reports"
  | "manage:settings"
  | "view:teacher_panel"
  | "view:parent_portal"
  | "view:student_portal";

export const permissionMatrix: Record<Role, Permission[]> = {
  super_admin: [
    "view:admin_dashboard",
    "manage:students",
    "manage:teachers",
    "manage:staff",
    "manage:academics",
    "manage:fees",
    "view:fees",
    "manage:payroll",
    "view:reports",
    "manage:settings",
  ],
  school_admin: [
    "view:admin_dashboard",
    "manage:students",
    "manage:teachers",
    "manage:staff",
    "manage:academics",
    "manage:fees",
    "view:fees",
    "manage:payroll",
    "view:reports",
    "manage:settings",
  ],
  teacher: ["view:teacher_panel", "manage:academics", "view:reports"],
  accountant: ["view:fees", "manage:fees", "view:reports"],
  parent: ["view:parent_portal", "view:fees"],
  student: ["view:student_portal"],
};

/**
 * Route prefixes each role may access. The guard treats these as
 * segment-bounded prefixes (`/x` matches `/x` and `/x/...`).
 */
export const allowedRoutePrefixes: Record<Role, string[]> = {
  super_admin: ["/"],
  school_admin: ["/"],
  teacher: ["/teacher", "/exams", "/settings"],
  accountant: ["/fees", "/reports", "/dashboard", "/settings"],
  parent: ["/parent"],
  student: ["/student"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionMatrix[role].includes(permission);
}

/** Segment-bounded prefix match — `/teacher` matches `/teacher/x` but not `/teachers`. */
function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") return true;
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  return allowedRoutePrefixes[role].some((p) => matchesPrefix(pathname, p));
}
