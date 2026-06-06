import { ReactNode } from "react";
import { useAuthStore } from "@/lib/auth";
import type { Role } from "@/lib/auth/types";

interface RoleGuardProps {
  /** Roles permitted to see the children. */
  allow: Role[];
  children: ReactNode;
  /** Optional fallback when the role is not permitted. */
  fallback?: ReactNode;
}

/**
 * Conditionally render UI based on the signed-in user's role.
 * Useful for hiding actions/sections within an otherwise shared page.
 */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  if (!user || !allow.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
