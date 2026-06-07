// Result service: aggregation, ranking and analytics over exam results.

import {
  getResultsByExam,
  getResultsByExamClass,
  studentResults,
  type StudentResult,
} from "@/data/exam/results";

export const resultService = {
  getByExam(examId: string): StudentResult[] {
    return getResultsByExam(examId);
  },

  getByExamClass(examId: string, className: string): StudentResult[] {
    return getResultsByExamClass(examId, className);
  },

  getByStudent(studentId: string): StudentResult[] {
    return studentResults.filter((r) => r.studentId === studentId);
  },

  /** Pass percentage across a result set. */
  passPercentage(results: StudentResult[]): number {
    if (!results.length) return 0;
    const passed = results.filter((r) => r.passed).length;
    return Math.round((passed / results.length) * 1000) / 10;
  },

  /** Subject-wise average for a result set (for bar charts). */
  subjectAverages(results: StudentResult[]): { subject: string; average: number }[] {
    if (!results.length) return [];
    const totals = new Map<string, { sum: number; count: number; max: number }>();
    results.forEach((r) =>
      r.subjects.forEach((s) => {
        const entry = totals.get(s.subject) ?? { sum: 0, count: 0, max: s.maxMarks };
        entry.sum += s.total;
        entry.count += 1;
        totals.set(s.subject, entry);
      }),
    );
    return [...totals.entries()].map(([subject, { sum, count, max }]) => ({
      subject,
      average: Math.round((sum / count / max) * 1000) / 10,
    }));
  },

  /** Top performers ordered by rank. */
  topPerformers(results: StudentResult[], limit = 5): StudentResult[] {
    return [...results].sort((a, b) => a.rank - b.rank).slice(0, limit);
  },

  /** Failure list for failure reports. */
  failures(results: StudentResult[]): StudentResult[] {
    return results.filter((r) => !r.passed);
  },

  /** Grade distribution for pie/bar charts. */
  gradeDistribution(results: StudentResult[]): { grade: string; count: number }[] {
    const counts = new Map<string, number>();
    results.forEach((r) => counts.set(r.grade, (counts.get(r.grade) ?? 0) + 1));
    return [...counts.entries()]
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  },

  /** Subject trend for a single student across exams. */
  studentSubjectTrend(studentId: string): { exam: string; percentage: number }[] {
    return this.getByStudent(studentId)
      .map((r) => ({ exam: r.examId, percentage: r.percentage }))
      .sort((a, b) => a.exam.localeCompare(b.exam));
  },

  /** Weak/strong subjects for a student's latest result. */
  subjectStrengths(studentId: string): { strong: string[]; weak: string[] } {
    const latest = this.getByStudent(studentId).at(-1);
    if (!latest) return { strong: [], weak: [] };
    const ranked = [...latest.subjects].sort(
      (a, b) => b.total / b.maxMarks - a.total / a.maxMarks,
    );
    return {
      strong: ranked.slice(0, 2).map((s) => s.subject),
      weak: ranked.slice(-2).map((s) => s.subject),
    };
  },
};
