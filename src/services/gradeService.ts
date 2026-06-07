// Grade service: percentage -> grade/GPA resolution and aggregate GPA helpers.

import { defaultGradeScale, type GradeBand, type GradeScale } from "@/data/exam/grades";

export const gradeService = {
  /** Resolve the grade band for a percentage against a scale. */
  bandForPercentage(percentage: number, scale: GradeScale = defaultGradeScale): GradeBand {
    const clamped = Math.max(0, Math.min(100, percentage));
    return (
      scale.bands.find((b) => clamped >= b.min && clamped <= b.max) ??
      scale.bands[scale.bands.length - 1]
    );
  },

  gradeFor(percentage: number, scale: GradeScale = defaultGradeScale): string {
    return this.bandForPercentage(percentage, scale).grade;
  },

  gpaFor(percentage: number, scale: GradeScale = defaultGradeScale): number {
    return this.bandForPercentage(percentage, scale).gpa;
  },

  isPass(percentage: number, scale: GradeScale = defaultGradeScale): boolean {
    return percentage >= scale.passPercentage;
  },

  /** Cumulative GPA across a set of subject percentages. */
  cumulativeGpa(percentages: number[], scale: GradeScale = defaultGradeScale): number {
    if (!percentages.length) return 0;
    const total = percentages.reduce((s, p) => s + this.gpaFor(p, scale), 0);
    return Math.round((total / percentages.length) * 100) / 100;
  },

  /** Validate a custom grade scale: contiguous, non-overlapping, 0-100 coverage. */
  validateScale(scale: GradeScale): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const sorted = [...scale.bands].sort((a, b) => b.min - a.min);
    sorted.forEach((band) => {
      if (band.min > band.max) errors.push(`${band.grade}: min cannot exceed max`);
      if (band.min < 0 || band.max > 100) errors.push(`${band.grade}: bounds must be 0-100`);
    });
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].min !== sorted[i + 1].max + 1) {
        errors.push(`Gap or overlap between ${sorted[i].grade} and ${sorted[i + 1].grade}`);
      }
    }
    return { valid: errors.length === 0, errors };
  },
};
