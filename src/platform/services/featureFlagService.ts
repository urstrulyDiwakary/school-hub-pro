// Feature-flag service. In production this reads from the tenant's
// subscription plan plus tenant-scoped overrides. UI consumers should
// never hardcode module visibility.

import type { FeatureFlag, FeatureFlagMap, Tenant } from "../types";

export const featureFlagService = {
  isEnabled(tenant: Tenant | null, flag: FeatureFlag): boolean {
    if (!tenant) return false;
    return tenant.featureFlags[flag] === true;
  },
  enabledFlags(tenant: Tenant | null): FeatureFlag[] {
    if (!tenant) return [];
    return (Object.entries(tenant.featureFlags) as [FeatureFlag, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k);
  },
  /** Merge subscription defaults with tenant overrides (future). */
  resolve(base: FeatureFlagMap, overrides: FeatureFlagMap): FeatureFlagMap {
    return { ...base, ...overrides };
  },
};
