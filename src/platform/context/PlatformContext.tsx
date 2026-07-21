// Platform → Tenant → Campus → AcademicYear → User → Permissions
//
// A single React provider that hydrates the tenant, resolves the active
// campus + academic year (persisted in localStorage), and exposes helpers
// that respect feature flags and action-level permissions.

import {
  createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode,
} from "react";
import { tenantService } from "../services/tenantService";
import { featureFlagService } from "../services/featureFlagService";
import { permissionService } from "../services/permissionService";
import { brandingService } from "../services/brandingService";
import { useAuthStore } from "@/lib/auth";
import type {
  Tenant, Campus, AcademicYear, FeatureFlag, ActionPermission, BrandingConfig,
} from "../types";

const CAMPUS_KEY = "edutrack.platform.campusId";
const AY_KEY = "edutrack.platform.academicYearId";

interface PlatformContextValue {
  tenant: Tenant | null;
  loading: boolean;
  campus: Campus | null;
  campuses: Campus[];
  academicYear: AcademicYear | null;
  academicYears: AcademicYear[];
  branding: BrandingConfig | null;

  setCampus: (id: string) => void;
  setAcademicYear: (id: string) => void;

  isFeatureEnabled: (flag: FeatureFlag) => boolean;
  can: (action: ActionPermission) => boolean;
  canAny: (actions: ActionPermission[]) => boolean;

  refresh: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [campusId, setCampusIdState] = useState<string | null>(
    () => (typeof localStorage !== "undefined" ? localStorage.getItem(CAMPUS_KEY) : null),
  );
  const [ayId, setAyIdState] = useState<string | null>(
    () => (typeof localStorage !== "undefined" ? localStorage.getItem(AY_KEY) : null),
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const t = await tenantService.getCurrentTenant();
      setTenant(t);
      brandingService.apply(t.branding);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const campus = useMemo(() => {
    if (!tenant) return null;
    return (
      tenant.campuses.find((c) => c.id === campusId) ??
      tenant.campuses.find((c) => c.isPrimary) ??
      tenant.campuses[0] ?? null
    );
  }, [tenant, campusId]);

  const academicYear = useMemo(() => {
    if (!tenant) return null;
    return (
      tenant.academicYears.find((a) => a.id === ayId) ??
      tenant.academicYears.find((a) => a.status === "current") ??
      tenant.academicYears[0] ?? null
    );
  }, [tenant, ayId]);

  const setCampus = useCallback((id: string) => {
    setCampusIdState(id);
    try { localStorage.setItem(CAMPUS_KEY, id); } catch { /* noop */ }
  }, []);
  const setAcademicYear = useCallback((id: string) => {
    setAyIdState(id);
    try { localStorage.setItem(AY_KEY, id); } catch { /* noop */ }
  }, []);

  const value = useMemo<PlatformContextValue>(() => ({
    tenant,
    loading,
    campus,
    campuses: tenant?.campuses ?? [],
    academicYear,
    academicYears: tenant?.academicYears ?? [],
    branding: tenant?.branding ?? null,
    setCampus,
    setAcademicYear,
    isFeatureEnabled: (flag) => featureFlagService.isEnabled(tenant, flag),
    can: (action) => permissionService.can(user?.role, action),
    canAny: (actions) => permissionService.canAny(user?.role, actions),
    refresh,
  }), [tenant, loading, campus, academicYear, user?.role, setCampus, setAcademicYear, refresh]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside <PlatformProvider>");
  return ctx;
}

// Narrow hooks — prefer these in components so re-renders stay tight.
export const useTenant = () => usePlatform().tenant;
export const useCampus = () => {
  const { campus, campuses, setCampus } = usePlatform();
  return { campus, campuses, setCampus };
};
export const useAcademicYear = () => {
  const { academicYear, academicYears, setAcademicYear } = usePlatform();
  return { academicYear, academicYears, setAcademicYear };
};
export const useFeatureFlag = (flag: FeatureFlag) => usePlatform().isFeatureEnabled(flag);
export const useCan = () => {
  const { can, canAny } = usePlatform();
  return { can, canAny };
};
