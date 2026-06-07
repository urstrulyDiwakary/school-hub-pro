// Hall ticket dataset: per-student admit cards with exam schedule + verification.

import { timetable, type TimetableSlot } from "./exams";

export interface HallTicket {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  /** Token encoded into the QR code for verification. */
  verificationCode: string;
  schedule: Pick<TimetableSlot, "date" | "startTime" | "endTime" | "subject" | "hall">[];
  instructions: string[];
}

export const examInstructions = [
  "Carry this hall ticket and a valid school ID to every exam.",
  "Reach the examination hall 30 minutes before the start time.",
  "Electronic devices, including mobile phones, are strictly prohibited.",
  "Use only blue or black ink pens; pencils for diagrams only.",
  "Do not carry any printed or written material into the hall.",
  "Follow all instructions given by the invigilator.",
];

const ticketStudents = [
  { studentId: "STU001", studentName: "Aarav Sharma", rollNo: "C10-01" },
  { studentId: "STU002", studentName: "Diya Patel", rollNo: "C10-02" },
  { studentId: "STU003", studentName: "Vihaan Reddy", rollNo: "C10-03" },
  { studentId: "STU004", studentName: "Ananya Iyer", rollNo: "C10-04" },
];

export const hallTickets: HallTicket[] = ticketStudents.map((s, i) => ({
  id: `HT-EXM005-${s.studentId}`,
  examId: "EXM005",
  examName: "Quarterly Examination",
  studentId: s.studentId,
  studentName: s.studentName,
  rollNo: s.rollNo,
  className: "Class 10",
  section: "A",
  verificationCode: `EDU-EXM005-${s.studentId}-${1000 + i}`,
  schedule: timetable.map((t) => ({
    date: t.date,
    startTime: t.startTime,
    endTime: t.endTime,
    subject: t.subject,
    hall: t.hall,
  })),
  instructions: examInstructions,
}));

export function getHallTicket(studentId: string): HallTicket | undefined {
  return hallTickets.find((h) => h.studentId === studentId);
}
