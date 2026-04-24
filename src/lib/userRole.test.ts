import { describe, it, expect, afterEach } from "vitest";
import {
  detectRoleFromPath,
  exportPermissions,
  resolveEffectivePermissions,
} from "./userRole";

describe("userRole", () => {
  describe("detectRoleFromPath", () => {
    it("returns 'teacher' for the bare /teacher route", () => {
      expect(detectRoleFromPath("/teacher")).toBe("teacher");
    });

    it("returns 'teacher' for any /teacher/* sub-route", () => {
      expect(detectRoleFromPath("/teacher/dashboard")).toBe("teacher");
      expect(detectRoleFromPath("/teacher/attendance/history")).toBe("teacher");
      expect(detectRoleFromPath("/teacher/marks")).toBe("teacher");
      expect(detectRoleFromPath("/teacher/payslip")).toBe("teacher");
    });

    it("returns 'admin' for plain admin paths", () => {
      expect(detectRoleFromPath("/")).toBe("admin");
      expect(detectRoleFromPath("/dashboard")).toBe("admin");
      expect(detectRoleFromPath("/students/123")).toBe("admin");
      expect(detectRoleFromPath("/reports")).toBe("admin");
      expect(detectRoleFromPath("/settings")).toBe("admin");
    });

    it("does NOT misclassify lookalike paths as teacher (regression guard)", () => {
      // Documented in detectRoleFromPath JSDoc — keep these locked.
      const lookalikes = [
        "/teachers",            // plural admin route
        "/teachers/123",        // admin viewing a teacher
        "/teachers/add",
        "/teacherment",         // arbitrary lookalike
        "/teacherly",
        "/teacher-admin",       // hyphen, not segment boundary
        "/teacher_dashboard",   // underscore, not segment boundary
        "/teacherX",            // any non-`/` char after /teacher
        "/teacher2",
        "/teacher.json",
        "/admin/teacher",       // teacher not at root
        "/admin/teacher/dashboard",
        "/v1/teacher",          // prefixed
        "/api/teacher/data",
      ];
      for (const p of lookalikes) {
        expect(detectRoleFromPath(p), `path: ${p}`).toBe("admin");
      }
    });

    it("is case-sensitive (uppercase variants are admin)", () => {
      expect(detectRoleFromPath("/Teacher")).toBe("admin");
      expect(detectRoleFromPath("/TEACHER/dashboard")).toBe("admin");
    });
  });

  describe("exportPermissions matrix", () => {
    it("admin can export CSV, PDF, and HTML fallback", () => {
      expect(exportPermissions.admin).toEqual({ csv: true, pdf: true, htmlFallback: true });
    });

    it("teacher can export PDF and HTML fallback only — never CSV", () => {
      expect(exportPermissions.teacher).toEqual({ csv: false, pdf: true, htmlFallback: true });
    });
  });

  describe("resolveEffectivePermissions (route-aware guard)", () => {
    const originalLocation = window.location;
    const setPath = (pathname: string) => {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, pathname },
      });
    };
    afterEach(() => {
      Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });

    it("on a teacher route, even role='admin' prop cannot unlock CSV", () => {
      setPath("/teacher/dashboard");
      const perms = resolveEffectivePermissions("admin");
      expect(perms.csv).toBe(false);
      expect(perms.pdf).toBe(true);
      expect(perms.routeRole).toBe("teacher");
    });

    it("on an admin route with role='teacher' prop, CSV stays disabled (stricter wins)", () => {
      setPath("/dashboard");
      const perms = resolveEffectivePermissions("teacher");
      expect(perms.csv).toBe(false);
      expect(perms.pdf).toBe(true);
    });

    it("on an admin route with role='admin' prop, CSV is enabled", () => {
      setPath("/dashboard");
      const perms = resolveEffectivePermissions("admin");
      expect(perms.csv).toBe(true);
      expect(perms.pdf).toBe(true);
    });

    it("falls back to route role when no prop is passed", () => {
      setPath("/teacher/marks");
      expect(resolveEffectivePermissions().csv).toBe(false);
      setPath("/students");
      expect(resolveEffectivePermissions().csv).toBe(true);
    });
  });
});
