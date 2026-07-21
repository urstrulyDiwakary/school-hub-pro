// Mock tenant fixture. Represents a fully-provisioned school on the
// "growth" plan. Replace with a real /tenants/:id fetch once the
// backend is live — the shape (see types.ts) is the contract.

import type { Tenant } from "./types";

export const MOCK_TENANT: Tenant = {
  id: "tnt_edutrack_demo",
  name: "Green Valley International School",
  slug: "green-valley",
  country: "IN",
  currency: "INR",
  timezone: "Asia/Kolkata",
  board: "CBSE",
  branding: {
    schoolName: "Green Valley International School",
    shortName: "GVIS",
    primaryColor: "231 76% 60%",
    secondaryColor: "160 84% 39%",
    fontFamily: "Inter",
    footerText: "© Green Valley International School",
  },
  subscription: {
    tier: "growth",
    status: "active",
    seats: 250,
    seatsUsed: 187,
    renewsAt: "2026-04-01",
    billingCycle: "annual",
  },
  featureFlags: {
    transport: true,
    hostel: false,
    library: true,
    payroll: true,
    inventory: false,
    lms: false,
    crm: false,
    hr: true,
    exams: true,
    communication: true,
    reports: true,
    fees: true,
    attendance: true,
    multi_campus: true,
    white_label: false,
    api_access: false,
    sso: false,
    mfa: false,
  },
  storage: { totalMB: 10240, usedMB: 3421, maxFileMB: 25 },
  campuses: [
    {
      id: "cmp_main",
      name: "Main Campus",
      code: "MAIN",
      address: "12 Rose Avenue, Bengaluru",
      timezone: "Asia/Kolkata",
      isPrimary: true,
    },
    {
      id: "cmp_north",
      name: "North Campus",
      code: "NRTH",
      address: "44 Hilltop Road, Bengaluru",
      timezone: "Asia/Kolkata",
    },
  ],
  academicYears: [
    { id: "ay_2025_26", label: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31", status: "current" },
    { id: "ay_2024_25", label: "2024-25", startDate: "2024-04-01", endDate: "2025-03-31", status: "previous" },
    { id: "ay_2023_24", label: "2023-24", startDate: "2023-04-01", endDate: "2024-03-31", status: "archived" },
  ],
  createdAt: "2023-04-01T00:00:00Z",
};
