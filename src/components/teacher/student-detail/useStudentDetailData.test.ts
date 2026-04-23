import { describe, it, expect } from "vitest";
import { computeStats } from "./useStudentDetailData";
import type { AttendanceStatus } from "@/data/teacherData";

describe("computeStats — single source of truth for student stats", () => {
  it("returns zeros for empty input", () => {
    const { stats, longestStreak, currentStreak } = computeStats(new Map());
    expect(stats).toEqual({ present: 0, absent: 0, late: 0, total: 0, rate: 0 });
    expect(longestStreak).toBe(0);
    expect(currentStreak).toBe(0);
  });

  it("computes counts and rate", () => {
    const m = new Map<string, AttendanceStatus>([
      ["2024-01-01", "present"],
      ["2024-01-02", "present"],
      ["2024-01-03", "absent"],
      ["2024-01-04", "late"],
    ]);
    const { stats } = computeStats(m);
    expect(stats).toEqual({ present: 2, absent: 1, late: 1, total: 4, rate: 50 });
  });

  it("computes longest and current streak in date order", () => {
    const m = new Map<string, AttendanceStatus>([
      ["2024-01-01", "present"],
      ["2024-01-02", "present"],
      ["2024-01-03", "present"],
      ["2024-01-04", "absent"],
      ["2024-01-05", "present"],
      ["2024-01-06", "present"],
    ]);
    const { longestStreak, currentStreak } = computeStats(m);
    expect(longestStreak).toBe(3);
    expect(currentStreak).toBe(2);
  });
});
