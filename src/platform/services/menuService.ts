// Dynamic menu engine. Given the current portal, permissions, and
// feature flags, returns the navigation graph the sidebar should render.
// The sidebar remains free to visually group items; this service only
// answers "what is allowed to show".

import type { Role } from "@/lib/auth/types";
import type { ActionPermission, FeatureFlag, Tenant } from "../types";
import { permissionService } from "./permissionService";
import { featureFlagService } from "./featureFlagService";

export interface MenuNode {
  key: string;
  title: string;
  href?: string;
  children?: MenuNode[];
  requires?: { permission?: ActionPermission; flag?: FeatureFlag };
}

export const menuService = {
  filter(nodes: MenuNode[], ctx: { role: Role | undefined; tenant: Tenant | null }): MenuNode[] {
    const walk = (list: MenuNode[]): MenuNode[] =>
      list
        .filter((n) => {
          if (n.requires?.permission && !permissionService.can(ctx.role, n.requires.permission)) return false;
          if (n.requires?.flag && !featureFlagService.isEnabled(ctx.tenant, n.requires.flag)) return false;
          return true;
        })
        .map((n) => (n.children ? { ...n, children: walk(n.children) } : n))
        .filter((n) => !n.children || n.children.length > 0 || n.href);
    return walk(nodes);
  },
};
