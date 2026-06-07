// Exam service: exam catalogue, timetable and dashboard statistics.

import { exams, timetable, type ExamConfig, type ExamStatus, type TimetableSlot } from "@/data/exam/exams";

export const examService = {
  getAll(): ExamConfig[] {
    return exams;
  },

  getById(id: string): ExamConfig | undefined {
    return exams.find((e) => e.id === id);
  },

  getByStatus(status: ExamStatus): ExamConfig[] {
    return exams.filter((e) => e.status === status);
  },

  getTimetable(examId?: string): TimetableSlot[] {
    return examId ? timetable.filter((t) => t.examId === examId) : timetable;
  },

  /** Dashboard overview counters. */
  dashboardStats() {
    const upcoming = exams.filter((e) => e.status === "upcoming").length;
    const completed = exams.filter((e) => e.status === "completed").length;
    const published = exams.filter((e) => e.resultStatus === "published").length;
    const pendingEvaluations = exams.filter(
      (e) => e.status === "completed" && e.resultStatus !== "published",
    ).length;
    return { upcoming, completed, published, pendingEvaluations, total: exams.length };
  },
};
