// Zustand store for examination module client state:
//   - active grade scale (custom grade configuration)
//   - result publishing status per exam (publish/draft/schedule)
//   - marks-entry drafts with auto-save persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultGradeScale, gradeScalePresets, type GradeScale } from "@/data/exam/grades";
import { exams, type ResultStatus } from "@/data/exam/exams";

interface MarksDraft {
  /** key: `${examId}:${className}:${subject}` -> { studentId: total } */
  [key: string]: Record<string, number>;
}

interface ExamState {
  gradeScale: GradeScale;
  setGradeScale: (scale: GradeScale) => void;
  resetGradeScale: () => void;

  /** Result publishing state, seeded from mock data. */
  publishStatus: Record<string, ResultStatus>;
  setPublishStatus: (examId: string, status: ResultStatus, scheduledAt?: string) => void;
  scheduledAt: Record<string, string | undefined>;

  /** Marks-entry drafts (auto-saved). */
  drafts: MarksDraft;
  saveDraft: (key: string, marks: Record<string, number>) => void;
  clearDraft: (key: string) => void;
}

const seededPublish = Object.fromEntries(exams.map((e) => [e.id, e.resultStatus]));
const seededScheduled = Object.fromEntries(exams.map((e) => [e.id, e.scheduledPublishAt]));

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      gradeScale: defaultGradeScale,
      setGradeScale: (gradeScale) => set({ gradeScale }),
      resetGradeScale: () => set({ gradeScale: gradeScalePresets.CBSE }),

      publishStatus: seededPublish,
      scheduledAt: seededScheduled,
      setPublishStatus: (examId, status, scheduledAt) =>
        set((s) => ({
          publishStatus: { ...s.publishStatus, [examId]: status },
          scheduledAt: { ...s.scheduledAt, [examId]: status === "scheduled" ? scheduledAt : undefined },
        })),

      drafts: {},
      saveDraft: (key, marks) =>
        set((s) => ({ drafts: { ...s.drafts, [key]: marks } })),
      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[key];
          return { drafts: next };
        }),
    }),
    { name: "edutrack-exam-store" },
  ),
);
