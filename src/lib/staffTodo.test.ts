import { describe, expect, it } from "vitest";
import { buildStaffTodos } from "./staffTodo";

const base = {
  totalClasses: 3,
  classesMarkedToday: 0,
  studentsWithResults: 0,
  totalStudents: 10,
  noticesLast7Days: 0,
  threadsAwaitingReply: 0,
};

describe("buildStaffTodos", () => {
  it("flags classes that still need attendance today", () => {
    const [attendance] = buildStaffTodos({ ...base, classesMarkedToday: 1 });
    expect(attendance.done).toBe(false);
    expect(attendance.detail).toBe("2 of 3 class(es) still need attendance.");
  });

  it("marks attendance done once every class is marked", () => {
    const [attendance] = buildStaffTodos({ ...base, classesMarkedToday: 3 });
    expect(attendance.done).toBe(true);
    expect(attendance.detail).toBe("All 3 class(es) marked for today.");
  });

  it("keeps attendance incomplete with no classes at all", () => {
    const [attendance] = buildStaffTodos({ ...base, totalClasses: 0, classesMarkedToday: 0 });
    expect(attendance.done).toBe(false);
    expect(attendance.detail).toBe("Add students in Live Records first.");
  });

  it("reports marks progress per student", () => {
    const [, marks] = buildStaffTodos({ ...base, studentsWithResults: 4 });
    expect(marks.done).toBe(false);
    expect(marks.detail).toBe("Results published for 4 of 10 student(s).");
  });

  it("marks results done when every student has results", () => {
    const [, marks] = buildStaffTodos({ ...base, studentsWithResults: 10 });
    expect(marks.done).toBe(true);
  });

  it("asks for a notice when none went out this week", () => {
    const [, , notices] = buildStaffTodos(base);
    expect(notices.done).toBe(false);
    expect(notices.detail).toBe("No notices sent in the last 7 days.");
  });

  it("surges unanswered parent messages first-class and done when none wait", () => {
    const [, , , messages] = buildStaffTodos({ ...base, threadsAwaitingReply: 2 });
    expect(messages.done).toBe(false);
    expect(messages.detail).toBe("2 conversation(s) waiting for your reply.");
    expect(messages.to).toBe("/inbox");

    const [, , , quiet] = buildStaffTodos(base);
    expect(quiet.done).toBe(true);
  });
});
