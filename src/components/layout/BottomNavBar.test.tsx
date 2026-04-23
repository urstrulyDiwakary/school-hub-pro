import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BottomNavBar } from "./BottomNavBar";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNavBar />
    </MemoryRouter>,
  );
}

describe("BottomNavBar — role-aware mobile navigation", () => {
  describe("Teacher routes", () => {
    it("shows teacher primary tabs on /teacher/dashboard", () => {
      renderAt("/teacher/dashboard");
      const nav = screen.getByRole("navigation");
      expect(within(nav).getByText("Dashboard")).toBeInTheDocument();
      expect(within(nav).getByText("Attendance")).toBeInTheDocument();
      expect(within(nav).getByText("Homework")).toBeInTheDocument();
      expect(within(nav).getByText("Marks")).toBeInTheDocument();
      // Admin-only items not present in primary
      expect(within(nav).queryByText("Students")).not.toBeInTheDocument();
      expect(within(nav).queryByText("Teachers")).not.toBeInTheDocument();
      expect(within(nav).queryByText("Fees")).not.toBeInTheDocument();
    });

    it("links the Attendance tab to /teacher/attendance", () => {
      renderAt("/teacher/dashboard");
      const link = screen.getByRole("link", { name: /attendance/i });
      expect(link).toHaveAttribute("href", "/teacher/attendance");
    });

    it("marks the Attendance tab active on /teacher/attendance/history", () => {
      renderAt("/teacher/attendance/history");
      // The Attendance link prefix-matches /teacher/attendance, so it should be active.
      const link = screen.getByRole("link", { name: /attendance/i });
      // Active items render with the primary color class
      expect(link.className).toMatch(/text-primary/);
    });
  });

  describe("Admin routes", () => {
    it("shows admin primary tabs on /dashboard", () => {
      renderAt("/dashboard");
      const nav = screen.getByRole("navigation");
      expect(within(nav).getByText("Students")).toBeInTheDocument();
      expect(within(nav).getByText("Teachers")).toBeInTheDocument();
      expect(within(nav).getByText("Fees")).toBeInTheDocument();
      // Teacher-only primary items not present
      expect(within(nav).queryByText("Homework")).not.toBeInTheDocument();
      expect(within(nav).queryByText("Marks")).not.toBeInTheDocument();
    });

    it("marks the Students tab active on /students/123", () => {
      renderAt("/students/123");
      const link = screen.getByRole("link", { name: /students/i });
      expect(link).toHaveAttribute("href", "/students");
      expect(link.className).toMatch(/text-primary/);
    });
  });
});
