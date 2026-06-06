// Results service: exam results, progress trends and aggregates.

import { getResultsByStudent, type ExamResult } from "@/data/portal/results";

export const resultsService = {
  getAll(studentId: string): ExamResult[] {
    return getResultsByStudent(studentId).sort((a, b) => (a.date < b.date ? -1 : 1));
  },

  getLatest(studentId: string): ExamResult | undefined {
    return this.getAll(studentId).at(-1);
  },

  /** Percentage progression across exams for line charts. */
  getProgressTrend(studentId: string): { exam: string; percentage: number; rank: number }[] {
    return this.getAll(studentId).map((r) => ({
      exam: r.examName,
      percentage: r.percentage,
      rank: r.rank,
    }));
  },

  /** Subject-wise marks for the latest exam (bar chart). */
  getSubjectBreakdown(studentId: string): { subject: string; marks: number; maxMarks: number }[] {
    const latest = this.getLatest(studentId);
    if (!latest) return [];
    return latest.subjects.map((s) => ({ subject: s.subject, marks: s.marks, maxMarks: s.maxMarks }));
  },

  getAveragePercentage(studentId: string): number {
    const all = this.getAll(studentId);
    if (!all.length) return 0;
    return Math.round((all.reduce((s, r) => s + r.percentage, 0) / all.length) * 10) / 10;
  },
};
