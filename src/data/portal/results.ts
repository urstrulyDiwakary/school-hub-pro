// Exam results dataset with subject-wise marks, percentage and rank.

export interface SubjectMark {
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  examName: string;
  term: string;
  date: string;
  subjects: SubjectMark[];
  percentage: number;
  rank: number;
  totalStudents: number;
}

function grade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  return "D";
}

function build(
  id: string,
  studentId: string,
  examName: string,
  term: string,
  date: string,
  rank: number,
  raw: [string, number][],
): ExamResult {
  const subjects: SubjectMark[] = raw.map(([subject, marks]) => ({
    subject,
    marks,
    maxMarks: 100,
    grade: grade(marks),
  }));
  const total = subjects.reduce((s, x) => s + x.marks, 0);
  const max = subjects.reduce((s, x) => s + x.maxMarks, 0);
  const percentage = Math.round((total / max) * 1000) / 10;
  return { id, studentId, examName, term, date, subjects, percentage, rank, totalStudents: 38 };
}

export const examResults: ExamResult[] = [
  build("EX001", "STU001", "Unit Test 1", "Term 1", "2024-07-20", 5, [
    ["Mathematics", 88],
    ["Science", 82],
    ["English", 90],
    ["Social Studies", 78],
    ["Hindi", 85],
    ["Computer Science", 95],
  ]),
  build("EX002", "STU001", "Half-Yearly", "Term 1", "2024-09-25", 4, [
    ["Mathematics", 91],
    ["Science", 85],
    ["English", 88],
    ["Social Studies", 80],
    ["Hindi", 83],
    ["Computer Science", 96],
  ]),
  build("EX003", "STU001", "Unit Test 2", "Term 2", "2024-12-15", 3, [
    ["Mathematics", 93],
    ["Science", 89],
    ["English", 91],
    ["Social Studies", 84],
    ["Hindi", 87],
    ["Computer Science", 98],
  ]),
  build("EX004", "STU001", "Annual Exam", "Term 2", "2025-03-20", 2, [
    ["Mathematics", 95],
    ["Science", 92],
    ["English", 93],
    ["Social Studies", 88],
    ["Hindi", 90],
    ["Computer Science", 99],
  ]),
  build("EX005", "STU002", "Annual Exam", "Term 2", "2025-03-20", 6, [
    ["Mathematics", 84],
    ["Science", 80],
    ["English", 88],
    ["EVS", 82],
    ["Hindi", 86],
  ]),
];

export function getResultsByStudent(studentId: string): ExamResult[] {
  return examResults.filter((r) => r.studentId === studentId);
}
