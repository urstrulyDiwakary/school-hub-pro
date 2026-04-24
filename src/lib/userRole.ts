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
 * Resolve the EFFECTIVE permissions for a render. We intersect the explicitly
 * passed role (if any) with the role detected from the current route.
 *
 * Rationale: a teacher viewing the teacher panel must NEVER see CSV, even if
 * a buggy parent passes `role="admin"` or DOM/state is manipulated. We take
 * the **stricter** of the two roles — if EITHER side says "no CSV", CSV is
 * disabled. This makes route-aware role guarding tamper-resistant.
 */
export function resolveEffectivePermissions(propRole?: UserRole) {
  const routeRole = getCurrentRole();
  const propPerms = propRole ? exportPermissions[propRole] : exportPermissions[routeRole];
  const routePerms = exportPermissions[routeRole];
  return {
    csv: propPerms.csv && routePerms.csv,
    pdf: propPerms.pdf && routePerms.pdf,
    htmlFallback: propPerms.htmlFallback && routePerms.htmlFallback,
    routeRole,
  };
}
