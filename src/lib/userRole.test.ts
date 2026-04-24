import { describe, it, expect } from "vitest";
import { detectRoleFromPath, exportPermissions } from "./userRole";

describe("userRole", () => {
  describe("detectRoleFromPath", () => {
    it("returns 'teacher' for /teacher/* paths", () => {
      expect(detectRoleFromPath("/teacher")).toBe("teacher");
      expect(detectRoleFromPath("/teacher/dashboard")).toBe("teacher");
      expect(detectRoleFromPath("/teacher/attendance/history")).toBe("teacher");
    });

    it("returns 'admin' for non-teacher paths", () => {
      expect(detectRoleFromPath("/")).toBe("admin");
      expect(detectRoleFromPath("/dashboard")).toBe("admin");
      expect(detectRoleFromPath("/students/123")).toBe("admin");
    });

    it("does NOT misclassify lookalike paths as teacher", () => {
      // These all start with "/teacher" textually but are NOT the teacher route
      expect(detectRoleFromPath("/teachers")).toBe("admin");
      expect(detectRoleFromPath("/teachers/123")).toBe("admin");
      expect(detectRoleFromPath("/teacherment")).toBe("admin");
      expect(detectRoleFromPath("/teacherly")).toBe("admin");
      expect(detectRoleFromPath("/teacher-admin")).toBe("admin");
      expect(detectRoleFromPath("/teacher_dashboard")).toBe("admin");
      expect(detectRoleFromPath("/admin/teacher")).toBe("admin"); // not at root
    });
  });

  describe("exportPermissions", () => {
    it("admin can export both CSV and PDF", () => {
      expect(exportPermissions.admin).toEqual({ csv: true, pdf: true });
    });

    it("teacher can export PDF only", () => {
      expect(exportPermissions.teacher).toEqual({ csv: false, pdf: true });
    });
  });
});
