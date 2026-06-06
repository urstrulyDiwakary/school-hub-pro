// Timetable & academic calendar datasets for the student portal.

export interface TimetableSlot {
  day: string;
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

const SUBJECTS: [string, string, string][] = [
  ["Mathematics", "Mr. Rajesh Kumar", "201"],
  ["Science", "Mrs. Anjali Verma", "Lab 2"],
  ["English", "Ms. Kavita Rao", "105"],
  ["Social Studies", "Mr. Sanjay Mehta", "108"],
  ["Hindi", "Mrs. Rekha Singh", "110"],
  ["Computer Science", "Mr. Amit Joshi", "Comp Lab"],
];

const TIMES = ["08:00", "08:50", "09:40", "10:50", "11:40", "12:30"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const timetable: TimetableSlot[] = DAYS.flatMap((day, di) =>
  TIMES.map((time, pi) => {
    const [subject, teacher, room] = SUBJECTS[(di + pi) % SUBJECTS.length];
    return { day, period: pi + 1, time, subject, teacher, room };
  }),
);

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "exam" | "holiday" | "event" | "activity";
}

export const calendarEvents: CalendarEvent[] = [
  { id: "C1", date: "2025-06-10", title: "Term 2 Fee Due", type: "event" },
  { id: "C2", date: "2025-06-14", title: "Parent-Teacher Meeting", type: "event" },
  { id: "C3", date: "2025-06-18", title: "Maths Unit Test 3", type: "exam" },
  { id: "C4", date: "2025-06-20", title: "Annual Sports Day", type: "activity" },
  { id: "C5", date: "2025-06-25", title: "Summer Break Begins", type: "holiday" },
  { id: "C6", date: "2025-07-01", title: "School Reopens", type: "event" },
  { id: "C7", date: "2025-07-15", title: "Science Exhibition", type: "activity" },
];

export interface UpcomingExam {
  id: string;
  subject: string;
  date: string;
  time: string;
  syllabus: string;
}

export const upcomingExams: UpcomingExam[] = [
  { id: "UE1", subject: "Mathematics", date: "2025-06-18", time: "09:00 AM", syllabus: "Algebra & Geometry" },
  { id: "UE2", subject: "Science", date: "2025-06-20", time: "09:00 AM", syllabus: "Photosynthesis, Force" },
  { id: "UE3", subject: "English", date: "2025-06-23", time: "09:00 AM", syllabus: "Grammar & Comprehension" },
];
