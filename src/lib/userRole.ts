/**
 * User role detection and export permission rules.
 *
 * ## detectRoleFromPath rules
 *
 * A path is classified as `"teacher"` ONLY when it represents a route inside
 * the teacher panel. Concretely, the pathname must equal `"/teacher"` exactly,
 * or start with the segment-bounded prefix `"/teacher/"`.
 *
 * Any other path — including paths that merely *start with the literal
 * substring* `"/teacher"` — is classified as `"admin"`.
 *
 * ### Examples
 *
 * Teacher (returns `"teacher"`):
 *   - `/teacher`
 *   - `/teacher/dashboard`
 *   - `/teacher/attendance/history`
 *
 * Admin (returns `"admin"`):
 *   - `/`                       (root)
 *   - `/dashboard`              (admin home)
 *   - `/teachers`               (plural — admin's teacher list)
 *   - `/teachers/123`           (admin viewing a teacher)
 *   - `/teacherment`            (lookalike, not a real route)
 *   - `/teacherly`              (lookalike)
 *   - `/teacher-admin`          (hyphenated, not a sub-route)
 *   - `/teacher_dashboard`      (underscore, not a sub-route)
 *   - `/admin/teacher`          (teacher segment not at root)
 *   - `/teacherX`               (any non-`/` char after `/teacher`)
 *
 * The boundary check uses `path === "/teacher" || path.startsWith("/teacher/")`
 * so that ONLY a literal `/` (or end-of-string) is accepted as the segment
 * delimiter. This prevents lookalike admin routes from being misclassified.
 */

import { exportConfigStore } from "./exportConfig";

export type UserRole = "admin" | "teacher";

export function detectRoleFromPath(pathname: string): UserRole {
  // Match /teacher exactly or /teacher/... but NOT /teachers, /teacherment, etc.
  return pathname === "/teacher" || pathname.startsWith("/teacher/") ? "teacher" : "admin";
}

export function getCurrentRole(): UserRole {
  if (typeof window === "undefined") return "admin";
  return detectRoleFromPath(window.location.pathname);
}

/**
 * Export permission matrix.
 *
 * Each role declares which export formats it may generate. The HTML fallback
 * is implicitly available whenever PDF is — it is the safety net used when
 * jsPDF generation fails at runtime.
 */
export const exportPermissions: Record<UserRole, { csv: boolean; pdf: boolean; htmlFallback: boolean }> = {
  admin: { csv: true, pdf: true, htmlFallback: true },
  teacher: { csv: false, pdf: true, htmlFallback: true },
};

/**
 * Resolve the EFFECTIVE permissions for a render.
 *
 * Layers, in order (each layer can only further RESTRICT, never expand a
 * granted permission — except the school config layer which is authoritative
 * because admins explicitly opted into it):
 *
 *   1. School config (`exportConfigStore`) — authoritative per-role matrix
 *      that OVERRIDES the hardcoded defaults. Admins configure this in
 *      `/settings/export-permissions`.
 *   2. Prop role vs route role — the stricter of the two wins. A teacher
 *      route can NEVER expose CSV even if `role="admin"` is passed.
 *
 * This makes the guard tamper-resistant: even if a parent component or DOM
 * state is manipulated, the route check + school config still apply.
 */
export function resolveEffectivePermissions(propRole?: UserRole) {
  const config = exportConfigStore.get();

  const routeRole = getCurrentRole();
  const effectiveRole: UserRole = propRole ?? routeRole;

  const propPerms = config.enabled[effectiveRole];
  const routePerms = config.enabled[routeRole];

  return {
    csv: propPerms.csv && routePerms.csv,
    pdf: propPerms.pdf && routePerms.pdf,
    htmlFallback: propPerms.htmlFallback && routePerms.htmlFallback,
    routeRole,
    effectiveRole,
    /** The default format the school configured for this role (UI hint only). */
    defaultFormat: config.defaultFormat[effectiveRole],
  };
}
