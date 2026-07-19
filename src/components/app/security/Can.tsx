import { ReactNode } from "react";
import { useAuthStore } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/types";
import { Button, type ButtonProps } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CanProps {
  permission?: Permission;
  roles?: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Render children only when the current user satisfies the permission/role guard. */
export function Can({ permission, roles, fallback = null, children }: CanProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <>{fallback}</>;
  if (roles && !roles.includes(user.role)) return <>{fallback}</>;
  if (permission && !hasPermission(user.role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}

interface PermissionButtonProps extends ButtonProps {
  permission?: Permission;
  roles?: Role[];
  denyMessage?: string;
}

/**
 * Button that renders as disabled with a tooltip explaining why when the
 * user lacks the required permission. Prefer this over hiding critical
 * actions so users can discover what an upgraded role would unlock.
 */
export function PermissionButton({
  permission,
  roles,
  denyMessage = "You don't have permission for this action.",
  children,
  ...rest
}: PermissionButtonProps) {
  const user = useAuthStore((s) => s.user);
  const allowed =
    !!user &&
    (!roles || roles.includes(user.role)) &&
    (!permission || hasPermission(user.role, permission));

  if (allowed) return <Button {...rest}>{children}</Button>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button {...rest} disabled aria-disabled>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{denyMessage}</TooltipContent>
    </Tooltip>
  );
}

interface PermissionMenuItemProps extends React.ComponentProps<typeof DropdownMenuItem> {
  permission?: Permission;
  roles?: Role[];
}

export function PermissionMenuItem({ permission, roles, ...rest }: PermissionMenuItemProps) {
  const user = useAuthStore((s) => s.user);
  const allowed =
    !!user &&
    (!roles || roles.includes(user.role)) &&
    (!permission || hasPermission(user.role, permission));
  if (!allowed) return null;
  return <DropdownMenuItem {...rest} />;
}
