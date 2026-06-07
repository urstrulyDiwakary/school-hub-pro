// Examination configuration, timetable and supporting datasets.

export type ExamType =
  | "Unit Test"
  | "Slip Test"
  | "Monthly Test"
  | "Quarterly"
  | "Half-Yearly"
  | "Pre-Final"
  | "Annual Exam";

export const examTypes: ExamType[] = [
  "Unit Test",
  "Slip Test",
  "Monthly Test",
  "Quarterly",
  "Half-Yearly",
  "Pre-Final",
  "Annual Exam",
];

export type ExamStatus = "upcoming" | "ongoing" | "completed";
export type ResultStatus = "draft" | "scheduled" | "published";

export interface ExamConfig {
  id: string;
  name: string;
  type: ExamType;
  academicYear: string;
  startDate: string;
  endDate: string;
  classes: string[];
  subjects: string[];
  maxMarks: number;
  passingMarks: number;
  status: ExamStatus;
  resultStatus: ResultStatus;
  /** Optional ISO timestamp for scheduled result publishing. */
  scheduledPublishAt?: string;
}

export interface TimetableSlot {
  id: string;
  examId: string;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  subject: string;
  hall: string;
  invigilator: string;
}

export const classList = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

export const subjectList = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Hindi",
  "Computer Science",
];

export const invigilators = [
  "Mr. Rajesh Kumar",
  "Ms. Priya Sharma",
  "Mr. Anil Verma",
  "Ms. Neha Gupta",
  "Mr. Suresh Iyer",
  "Ms. Kavita Rao",
];

export const halls = ["Hall A", "Hall B", "Hall C", "Lab 1", "Auditorium"];

export const exams: ExamConfig[] = [
  {
    id: "EXM001",
    name: "Annual Examination 2025",
    type: "Annual Exam",
    academicYear: "2024-25",
    startDate: "2025-03-10",
    endDate: "2025-03-22",
    classes: ["Class 9", "Class 10"],
    subjects: subjectList,
    maxMarks: 100,
    passingMarks: 33,
    status: "completed",
    resultStatus: "published",
  },
  {
    id: "EXM002",
    name: "Pre-Final Examination",
    type: "Pre-Final",
    academicYear: "2024-25",
    startDate: "2025-02-05",
    endDate: "2025-02-14",
    classes: ["Class 10"],
    subjects: subjectList,
    maxMarks: 100,
    passingMarks: 33,
    status: "completed",
    resultStatus: "published",
  },
  {
    id: "EXM003",
    name: "Half-Yearly Examination",
    type: "Half-Yearly",
    academicYear: "2024-25",
    startDate: "2024-09-20",
    endDate: "2024-09-30",
    classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    subjects: subjectList,
    maxMarks: 80,
    passingMarks: 27,
    status: "completed",
    resultStatus: "draft",
  },
  {
    id: "EXM004",
    name: "Monthly Test - July",
    type: "Monthly Test",
    academicYear: "2025-26",
    startDate: "2025-07-21",
    endDate: "2025-07-25",
    classes: ["Class 6", "Class 7", "Class 8"],
    subjects: ["Mathematics", "Science", "English"],
    maxMarks: 25,
    passingMarks: 9,
    status: "upcoming",
    resultStatus: "draft",
  },
  {
    id: "EXM005",
    name: "Quarterly Examination",
    type: "Quarterly",
    academicYear: "2025-26",
    startDate: "2025-08-11",
    endDate: "2025-08-20",
    classes: ["Class 9", "Class 10"],
    subjects: subjectList,
    maxMarks: 100,
    passingMarks: 33,
    status: "upcoming",
    resultStatus: "scheduled",
    scheduledPublishAt: "2025-08-30T10:00:00",
  },
  {
    id: "EXM006",
    name: "Unit Test 1",
    type: "Unit Test",
    academicYear: "2025-26",
    startDate: "2025-06-16",
    endDate: "2025-06-18",
    classes: ["Class 6", "Class 7"],
    subjects: ["Mathematics", "English"],
    maxMarks: 20,
    passingMarks: 7,
    status: "ongoing",
    resultStatus: "draft",
  },
];

function buildTimetable(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  const exam = exams[4]; // Quarterly
  let day = 0;
  exam.subjects.forEach((subject, i) => {
    const date = new Date(exam.startDate);
    date.setDate(date.getDate() + day);
    day += 1;
    slots.push({
      id: `TT-${exam.id}-${i}`,
      examId: exam.id,
      date: date.toISOString().slice(0, 10),
      startTime: "09:30",
      endTime: "12:30",
      className: "Class 10",
      subject,
      hall: halls[i % halls.length],
      invigilator: invigilators[i % invigilators.length],
    });
  });
  return slots;
}

export const timetable: TimetableSlot[] = buildTimetable();

/** Monthly exam activity for dashboard chart. */
export const monthlyExamActivity = [
  { month: "Apr", exams: 2 },
  { month: "May", exams: 1 },
  { month: "Jun", exams: 3 },
  { month: "Jul", exams: 4 },
  { month: "Aug", exams: 2 },
  { month: "Sep", exams: 5 },
  { month: "Oct", exams: 3 },
];
