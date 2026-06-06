import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { canAccessRoute } from "@/lib/auth/permissions";

/**
 * Route guard for all protected areas.
 *
 *  - Unauthenticated users are redirected to /login (with `from` preserved).
 *  - Authenticated users without route access land on /unauthorized.
 *
 * Access is decided by the permission matrix (`canAccessRoute`), so adding a
 * role or route only requires editing `permissions.ts`.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
