// Action-level permission engine (permissions v2).
//
// Coexists with the legacy page-level permissions in `src/lib/auth`.
// The legacy system continues to guard routes; this new system guards
// buttons and inline actions using `<resource>.<action>` strings.

import type { Role } from "@/lib/auth/types";
import type { ActionPermission } from "../types";

const ADMIN_ALL: ActionPermission[] = [
  "students.view", "students.create", "students.edit", "students.delete", "students.export", "students.import",
  "teachers.view", "teachers.create", "teachers.edit", "teachers.delete", "teachers.export",
  "staff.view", "staff.create", "staff.edit", "staff.delete",
  "fees.view", "fees.collect", "fees.refund", "fees.export", "fees.configure",
  "payroll.view", "payroll.process", "payroll.audit", "payroll.export",
  "exams.view", "exams.configure", "exams.enter_marks", "exams.publish", "exams.export",
  "attendance.view", "attendance.mark", "attendance.export",
  "communication.view", "communication.send", "communication.broadcast",
  "reports.view", "reports.download",
  "settings.view", "settings.edit",
  "branding.edit", "campus.manage", "subscription.manage", "users.manage", "audit.view",
];

export const rolePermissions: Record<Role, ActionPermission[]> = {
  super_admin: [...ADMIN_ALL],
  school_admin: ADMIN_ALL.filter((p) => p !== "subscription.manage"),
  teacher: [
    "students.view", "teachers.view",
    "attendance.view", "attendance.mark", "attendance.export",
    "exams.view", "exams.enter_marks",
    "communication.view", "communication.send",
    "reports.view", "portal.teacher",
  ],
  accountant: [
    "students.view",
    "fees.view", "fees.collect", "fees.refund", "fees.export", "fees.configure",
    "payroll.view", "payroll.audit", "payroll.export",
    "reports.view", "reports.download",
  ],
  parent: [
    "portal.parent",
    "students.view", "attendance.view", "fees.view", "exams.view",
    "communication.view",
  ],
  student: [
    "portal.student",
    "attendance.view", "exams.view", "fees.view", "communication.view",
  ],
};

export const permissionService = {
  can(role: Role | undefined, action: ActionPermission): boolean {
    if (!role) return false;
    return rolePermissions[role]?.includes(action) ?? false;
  },
  canAny(role: Role | undefined, actions: ActionPermission[]): boolean {
    return actions.some((a) => permissionService.can(role, a));
  },
  canAll(role: Role | undefined, actions: ActionPermission[]): boolean {
    return actions.every((a) => permissionService.can(role, a));
  },
  list(role: Role | undefined): ActionPermission[] {
    return role ? [...rolePermissions[role]] : [];
  },
};
