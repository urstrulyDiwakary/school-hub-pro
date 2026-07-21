// Declarative permission gate for buttons and inline actions.
// Prefer this over ad-hoc role checks — it drives off the action-level
// permission engine so subscription/feature-flag changes propagate for free.

import type { ReactNode } from "react";
import { useCan } from "../context/PlatformContext";
import type { ActionPermission, FeatureFlag } from "../types";
import { usePlatform } from "../context/PlatformContext";

interface CanProps {
  action?: ActionPermission;
  anyOf?: ActionPermission[];
  feature?: FeatureFlag;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ action, anyOf, feature, fallback = null, children }: CanProps) {
  const { can, canAny } = useCan();
  const { isFeatureEnabled } = usePlatform();

  if (feature && !isFeatureEnabled(feature)) return <>{fallback}</>;
  if (action && !can(action)) return <>{fallback}</>;
  if (anyOf && !canAny(anyOf)) return <>{fallback}</>;
  return <>{children}</>;
}
