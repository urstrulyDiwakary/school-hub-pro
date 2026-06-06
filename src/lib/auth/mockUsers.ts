// Demo accounts for each role. In production these would come from the
// auth backend; the UI layer is identical either way (API-ready).

import type { AuthUser, Role } from "./types";

export interface MockCredential extends AuthUser {
  password: string;
}

export const mockUsers: MockCredential[] = [
  {
    id: "u-super",
    name: "Vikram Rao",
    email: "super@edutrack.in",
    role: "super_admin",
    password: "super123",
    initials: "VR",
  },
  {
    id: "u-admin",
    name: "School Admin",
    email: "admin@edutrack.in",
    role: "school_admin",
    password: "admin123",
    initials: "SA",
  },
  {
    id: "u-teacher",
    name: "Mr. Rajesh Kumar",
    email: "teacher@edutrack.in",
    role: "teacher",
    password: "teacher123",
    initials: "RK",
  },
  {
    id: "u-parent",
    name: "Sunita Sharma",
    email: "parent@edutrack.in",
    role: "parent",
    password: "parent123",
    initials: "SS",
    studentIds: ["STU001"],
  },
  {
    id: "u-student",
    name: "Aarav Sharma",
    email: "student@edutrack.in",
    role: "student",
    password: "student123",
    initials: "AS",
    studentIds: ["STU001"],
  },
  {
    id: "u-accountant",
    name: "Neha Gupta",
    email: "accounts@edutrack.in",
    role: "accountant",
    password: "accounts123",
    initials: "NG",
  },
];

export function authenticate(email: string, password: string): AuthUser | null {
  const match = mockUsers.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!match) return null;
  const { password: _pw, ...user } = match;
  return user;
}

export const demoCredentialsByRole: Record<Role, { email: string; password: string }> = {
  super_admin: { email: "super@edutrack.in", password: "super123" },
  school_admin: { email: "admin@edutrack.in", password: "admin123" },
  teacher: { email: "teacher@edutrack.in", password: "teacher123" },
  parent: { email: "parent@edutrack.in", password: "parent123" },
  student: { email: "student@edutrack.in", password: "student123" },
  accountant: { email: "accounts@edutrack.in", password: "accounts123" },
};
