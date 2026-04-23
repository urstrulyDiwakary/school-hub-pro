export type UserRole = "admin" | "teacher";

export function detectRoleFromPath(pathname: string): UserRole {
  // Match /teacher exactly or /teacher/... but not /teachers
  return pathname === "/teacher" || pathname.startsWith("/teacher/") ? "teacher" : "admin";
}

export function getCurrentRole(): UserRole {
  if (typeof window === "undefined") return "admin";
  return detectRoleFromPath(window.location.pathname);
}

// Export permissions per role
export const exportPermissions: Record<UserRole, { csv: boolean; pdf: boolean }> = {
  admin: { csv: true, pdf: true },
  teacher: { csv: false, pdf: true },
};
