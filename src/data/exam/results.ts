// Exam results dataset with component-wise marks (theory, practical, internal, viva).
//
// Results feed the report cards, analytics and publishing workflows. A small but
// realistic generator keeps ranks, percentages and grades internally consistent.

import { cbseBands, type GradeBand } from "./grades";
import { subjectList } from "./exams";

export interface SubjectScore {
  subject: string;
  theory: number;
  practical: number;
  internal: number;
  viva: number;
  maxMarks: number;
  total: number;
  grade: string;
}

export interface StudentResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  subjects: SubjectScore[];
  totalMarks: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  gpa: number;
  rank: number;
  passed: boolean;
  attendancePercentage: number;
}

function gradeForPct(pct: number, bands: GradeBand[] = cbseBands): GradeBand {
  return bands.find((b) => pct >= b.min && pct <= b.max) ?? bands[bands.length - 1];
}

const studentNames = [
  "Aarav Sharma",
  "Diya Patel",
  "Vihaan Reddy",
  "Ananya Iyer",
  "Arjun Nair",
  "Ishaan Gupta",
  "Saanvi Rao",
  "Kabir Mehta",
];

// Deterministic pseudo-random so results are stable across reloads.
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildResults(examId: string, className: string, maxMarks: number): StudentResult[] {
  const rng = seeded(examId.length * 97 + className.length * 13);
  const records: StudentResult[] = studentNames.map((name, idx) => {
    const subjects: SubjectScore[] = subjectList.map((subject) => {
      const theory = Math.round(maxMarks * 0.6 * (0.55 + rng() * 0.45));
      const practical = Math.round(maxMarks * 0.2 * (0.6 + rng() * 0.4));
      const internal = Math.round(maxMarks * 0.1 * (0.7 + rng() * 0.3));
      const viva = Math.round(maxMarks * 0.1 * (0.7 + rng() * 0.3));
      const total = Math.min(maxMarks, theory + practical + internal + viva);
      const pct = (total / maxMarks) * 100;
      return {
        subject,
        theory,
        practical,
        internal,
        viva,
        maxMarks,
        total,
        grade: gradeForPct(pct).grade,
      };
    });
    const totalMarks = subjects.reduce((s, x) => s + x.total, 0);
    const maxTotal = subjects.length * maxMarks;
    const percentage = Math.round((totalMarks / maxTotal) * 1000) / 10;
    const band = gradeForPct(percentage);
    return {
      id: `RES-${examId}-${className}-${idx}`.replace(/\s/g, ""),
      examId,
      studentId: `STU${String(idx + 1).padStart(3, "0")}`,
      studentName: name,
      rollNo: `${className.replace("Class ", "C")}-${String(idx + 1).padStart(2, "0")}`,
      className,
      section: "A",
      subjects,
      totalMarks,
      maxTotal,
      percentage,
      grade: band.grade,
      gpa: band.gpa,
      rank: 0,
      passed: percentage >= 33,
      attendancePercentage: Math.round((85 + rng() * 14) * 10) / 10,
    };
  });

  // Assign ranks by percentage (descending).
  [...records]
    .sort((a, b) => b.percentage - a.percentage)
    .forEach((r, i) => {
      r.rank = i + 1;
    });

  return records;
}

export const studentResults: StudentResult[] = [
  ...buildResults("EXM001", "Class 10", 100),
  ...buildResults("EXM001", "Class 9", 100),
  ...buildResults("EXM002", "Class 10", 100),
  ...buildResults("EXM003", "Class 10", 80),
];

export function getResultsByExam(examId: string): StudentResult[] {
  return studentResults.filter((r) => r.examId === examId);
}

export function getResultsByExamClass(examId: string, className: string): StudentResult[] {
  return studentResults.filter((r) => r.examId === examId && r.className === className);
}
