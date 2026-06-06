// Homework & assignments dataset.

export type HomeworkStatus = "pending" | "submitted" | "graded" | "overdue";

export interface Homework {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: HomeworkStatus;
  grade?: string;
  teacher: string;
}

export const homeworkRecords: Homework[] = [
  {
    id: "HW001",
    studentId: "STU001",
    subject: "Mathematics",
    title: "Algebra Worksheet 5",
    description: "Solve problems 1-20 on linear equations.",
    assignedDate: "2025-06-02",
    dueDate: "2025-06-07",
    status: "pending",
    teacher: "Mr. Rajesh Kumar",
  },
  {
    id: "HW002",
    studentId: "STU001",
    subject: "Science",
    title: "Photosynthesis Diagram",
    description: "Draw and label the process of photosynthesis.",
    assignedDate: "2025-06-01",
    dueDate: "2025-06-05",
    status: "submitted",
    teacher: "Mrs. Anjali Verma",
  },
  {
    id: "HW003",
    studentId: "STU001",
    subject: "English",
    title: "Essay: My Summer Vacation",
    description: "Write a 300-word essay.",
    assignedDate: "2025-05-28",
    dueDate: "2025-06-03",
    status: "graded",
    grade: "A",
    teacher: "Ms. Kavita Rao",
  },
  {
    id: "HW004",
    studentId: "STU001",
    subject: "Social Studies",
    title: "Map of Ancient India",
    description: "Mark major civilizations on the outline map.",
    assignedDate: "2025-05-25",
    dueDate: "2025-05-30",
    status: "overdue",
    teacher: "Mr. Sanjay Mehta",
  },
  {
    id: "HW005",
    studentId: "STU001",
    subject: "Hindi",
    title: "व्याकरण अभ्यास",
    description: "संज्ञा और सर्वनाम के प्रश्न हल करें।",
    assignedDate: "2025-06-03",
    dueDate: "2025-06-09",
    status: "pending",
    teacher: "Mrs. Rekha Singh",
  },
  {
    id: "HW006",
    studentId: "STU001",
    subject: "Computer Science",
    title: "Scratch Animation Project",
    description: "Build a simple animation using loops.",
    assignedDate: "2025-05-30",
    dueDate: "2025-06-06",
    status: "graded",
    grade: "A+",
    teacher: "Mr. Amit Joshi",
  },
  {
    id: "HW007",
    studentId: "STU002",
    subject: "Mathematics",
    title: "Multiplication Tables",
    description: "Practice tables 6 to 10.",
    assignedDate: "2025-06-02",
    dueDate: "2025-06-06",
    status: "pending",
    teacher: "Ms. Pooja Nair",
  },
];

export function getHomeworkByStudent(studentId: string): Homework[] {
  return homeworkRecords.filter((h) => h.studentId === studentId);
}
