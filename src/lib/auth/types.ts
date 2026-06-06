// Core authentication & role types for EduTrack Pro.
// Six roles span the full school hierarchy. Roles drive navigation,
// route guards and the permission matrix.

export type Role =
  | "super_admin"
  | "school_admin"
  | "teacher"
  | "parent"
  | "student"
  | "accountant";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Optional avatar initials override. */
  initials?: string;
  /** Linked child/student ids (for parents) or own student id (for students). */
  studentIds?: string[];
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
  accountant: "Accountant",
};

/** Landing route for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/dashboard",
  school_admin: "/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  student: "/student/dashboard",
  accountant: "/fees",
};
