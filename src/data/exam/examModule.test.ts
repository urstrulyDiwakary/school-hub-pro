import { describe, expect, it, beforeEach } from "vitest";
import { gradeService } from "@/services/gradeService";
import { resultService } from "@/services/resultService";
import { gradeScalePresets, defaultGradeScale } from "@/data/exam/grades";
import { getResultsByExam } from "@/data/exam/results";
import { useExamStore } from "@/lib/exam/examStore";

describe("gradeService - grade calculation", () => {
  it("resolves grades at band boundaries", () => {
    expect(gradeService.gradeFor(95)).toBe("A+");
    expect(gradeService.gradeFor(90)).toBe("A+");
    expect(gradeService.gradeFor(89)).toBe("A");
    expect(gradeService.gradeFor(60)).toBe("B");
    expect(gradeService.gradeFor(10)).toBe("F");
  });

  it("clamps out-of-range percentages", () => {
    expect(gradeService.gradeFor(120)).toBe("A+");
    expect(gradeService.gradeFor(-5)).toBe("F");
  });

  it("computes GPA and cumulative GPA", () => {
    expect(gradeService.gpaFor(95)).toBe(10);
    expect(gradeService.cumulativeGpa([95, 85])).toBe(9.5);
    expect(gradeService.cumulativeGpa([])).toBe(0);
  });

  it("applies board-specific pass thresholds", () => {
    expect(gradeService.isPass(35, gradeScalePresets.CBSE)).toBe(true);
    expect(gradeService.isPass(35, gradeScalePresets.ICSE)).toBe(false);
  });

  it("validates a contiguous default scale and flags gaps", () => {
    expect(gradeService.validateScale(defaultGradeScale).valid).toBe(true);
    const broken = { ...defaultGradeScale, bands: [{ grade: "A", min: 90, max: 100, gpa: 10, description: "" }, { grade: "B", min: 60, max: 80, gpa: 7, description: "" }] };
    expect(gradeService.validateScale(broken).valid).toBe(false);
  });
});

describe("resultService - result generation & analytics", () => {
  const results = resultService.getByExamClass("EXM001", "Class 10");

  it("generates consistent ranks and percentages", () => {
    const ranks = results.map((r) => r.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
    results.forEach((r) => {
      expect(r.percentage).toBeGreaterThanOrEqual(0);
      expect(r.percentage).toBeLessThanOrEqual(100);
    });
  });

  it("computes pass percentage within 0-100", () => {
    const pct = resultService.passPercentage(results);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it("orders top performers by rank", () => {
    const top = resultService.topPerformers(results, 3);
    expect(top[0].rank).toBeLessThan(top[1].rank);
  });

  it("produces a grade distribution that sums to the cohort size", () => {
    const total = resultService.gradeDistribution(results).reduce((s, g) => s + g.count, 0);
    expect(total).toBe(results.length);
  });
});

describe("report card data integrity", () => {
  it("each result has subject totals not exceeding max marks", () => {
    getResultsByExam("EXM001").forEach((r) => {
      r.subjects.forEach((s) => {
        expect(s.total).toBeLessThanOrEqual(s.maxMarks);
        expect(s.theory + s.practical + s.internal + s.viva).toBeGreaterThanOrEqual(s.total);
      });
      expect(r.totalMarks).toBeLessThanOrEqual(r.maxTotal);
    });
  });
});

describe("publishing workflow", () => {
  beforeEach(() => {
    useExamStore.setState({ publishStatus: { EXM005: "draft" }, scheduledAt: {} });
  });

  it("transitions draft -> scheduled -> published", () => {
    const { setPublishStatus } = useExamStore.getState();
    setPublishStatus("EXM005", "scheduled", "2025-08-30T10:00");
    expect(useExamStore.getState().publishStatus.EXM005).toBe("scheduled");
    expect(useExamStore.getState().scheduledAt.EXM005).toBe("2025-08-30T10:00");

    setPublishStatus("EXM005", "published");
    expect(useExamStore.getState().publishStatus.EXM005).toBe("published");
    expect(useExamStore.getState().scheduledAt.EXM005).toBeUndefined();
  });
});
