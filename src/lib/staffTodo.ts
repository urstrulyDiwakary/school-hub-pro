// Pure builder for the staff dashboard to-do list. Kept free of side effects
// so it is unit-testable: the dashboard only feeds it live counts.

export interface StaffTodoInput {
  /** Distinct class+section groups on the roll. */
  totalClasses: number;
  /** Classes with at least one attendance record saved for today. */
  classesMarkedToday: number;
  /** Distinct students with at least one exam result published. */
  studentsWithResults: number;
  totalStudents: number;
  /** Announcements published in the last 7 days. */
  noticesLast7Days: number;
  /** Parent threads whose latest message still needs a staff reply. */
  threadsAwaitingReply: number;
}

export interface StaffTodo {
  id: "attendance" | "marks" | "notices" | "messages";
  label: string;
  detail: string;
  done: boolean;
  /** Where to act on this item. */
  to: string;
  tone: "warning" | "info" | "primary" | "destructive";
}

export function buildStaffTodos(i: StaffTodoInput): StaffTodo[] {
  const classesLeft = Math.max(0, i.totalClasses - i.classesMarkedToday);
  const attendance: StaffTodo = {
    id: "attendance",
    label: "Mark today's attendance",
    detail:
      i.totalClasses === 0
        ? "Add students in Live Records first."
        : classesLeft === 0
          ? `All ${i.totalClasses} class(es) marked for today.`
          : `${classesLeft} of ${i.totalClasses} class(es) still need attendance.`,
    done: i.totalClasses > 0 && classesLeft === 0,
    to: "/records",
    tone: "warning",
  };

  const marksLeft = Math.max(0, i.totalStudents - i.studentsWithResults);
  const marks: StaffTodo = {
    id: "marks",
    label: "Enter exam marks",
    detail:
      i.studentsWithResults === 0
        ? "No results published yet — parents see them as soon as you save."
        : marksLeft === 0
          ? `Results published for all ${i.totalStudents} student(s).`
          : `Results published for ${i.studentsWithResults} of ${i.totalStudents} student(s).`,
    done: i.totalStudents > 0 && marksLeft === 0,
    to: "/records",
    tone: "info",
  };

  const notices: StaffTodo = {
    id: "notices",
    label: "Send a notice",
    detail:
      i.noticesLast7Days === 0
        ? "No notices sent in the last 7 days."
        : `${i.noticesLast7Days} notice(s) sent this week.`,
    done: i.noticesLast7Days > 0,
    to: "/communication",
    tone: "primary",
  };

  const messages: StaffTodo = {
    id: "messages",
    label: "Reply to parent messages",
    detail:
      i.threadsAwaitingReply === 0
        ? "No parent messages waiting for a reply."
        : `${i.threadsAwaitingReply} conversation(s) waiting for your reply.`,
    done: i.threadsAwaitingReply === 0,
    to: "/inbox",
    tone: "destructive",
  };

  return [attendance, marks, notices, messages];
}
