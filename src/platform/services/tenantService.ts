// Tenant service — API-ready facade.
//
// Every method returns a Promise so the swap to a real HTTP client is
// mechanical: replace the body, keep the signature. UI code must never
// import mock fixtures directly — always route through a service.

import type { Tenant, TenantID, CampusID, AcademicYearID, BrandingConfig } from "../types";
import { MOCK_TENANT } from "../mockTenant";

const delay = <T>(v: T, ms = 60) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const tenantService = {
  /** GET /tenants/current */
  async getCurrentTenant(): Promise<Tenant> {
    return delay(MOCK_TENANT);
  },

  /** GET /tenants/:id */
  async getTenant(id: TenantID): Promise<Tenant> {
    if (id !== MOCK_TENANT.id) throw new Error(`Tenant ${id} not found`);
    return delay(MOCK_TENANT);
  },

  /** PATCH /tenants/:id/branding */
  async updateBranding(_id: TenantID, patch: Partial<BrandingConfig>): Promise<BrandingConfig> {
    return delay({ ...MOCK_TENANT.branding, ...patch });
  },

  /** GET /tenants/:id/campuses */
  async listCampuses(_id: TenantID) {
    return delay(MOCK_TENANT.campuses);
  },

  /** GET /tenants/:id/academic-years */
  async listAcademicYears(_id: TenantID) {
    return delay(MOCK_TENANT.academicYears);
  },

  /** Return campus by id, or the primary campus. */
  async getCampus(id?: CampusID) {
    const found = id ? MOCK_TENANT.campuses.find((c) => c.id === id) : undefined;
    return delay(found ?? MOCK_TENANT.campuses.find((c) => c.isPrimary) ?? MOCK_TENANT.campuses[0]);
  },

  async getAcademicYear(id?: AcademicYearID) {
    const found = id ? MOCK_TENANT.academicYears.find((a) => a.id === id) : undefined;
    return delay(found ?? MOCK_TENANT.academicYears.find((a) => a.status === "current")!);
  },
};

export type TenantService = typeof tenantService;
