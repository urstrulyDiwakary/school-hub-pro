// Notifications, circulars and announcements dataset.

export type NotificationType = "message" | "circular" | "announcement" | "alert";
export type Audience = "all" | "parent" | "student";

export interface Notification {
  id: string;
  type: NotificationType;
  audience: Audience;
  title: string;
  message: string;
  date: string;
  read: boolean;
  from: string;
}

export const notifications: Notification[] = [
  {
    id: "N001",
    type: "alert",
    audience: "parent",
    title: "Attendance Alert",
    message: "Aarav was marked absent on 04 Jun 2025. Please submit a reason if applicable.",
    date: "2025-06-04T09:30:00+05:30",
    read: false,
    from: "Class Teacher",
  },
  {
    id: "N002",
    type: "circular",
    audience: "all",
    title: "Annual Sports Day",
    message: "Annual Sports Day will be held on 20 Jun 2025. Participation forms due by 12 Jun.",
    date: "2025-06-03T11:00:00+05:30",
    read: false,
    from: "Principal's Office",
  },
  {
    id: "N003",
    type: "announcement",
    audience: "all",
    title: "PTM Scheduled",
    message: "Parent-Teacher Meeting on 14 Jun 2025, 10:00 AM - 1:00 PM.",
    date: "2025-06-02T16:00:00+05:30",
    read: true,
    from: "Academic Coordinator",
  },
  {
    id: "N004",
    type: "message",
    audience: "student",
    title: "Library Books Due",
    message: "Please return borrowed library books before the summer break.",
    date: "2025-06-01T13:20:00+05:30",
    read: false,
    from: "Library",
  },
  {
    id: "N005",
    type: "circular",
    audience: "all",
    title: "Fee Reminder",
    message: "Term 2 transport fee is due on 10 Jun 2025.",
    date: "2025-05-30T10:00:00+05:30",
    read: true,
    from: "Accounts Department",
  },
  {
    id: "N006",
    type: "announcement",
    audience: "all",
    title: "Summer Break",
    message: "School closed for summer break from 25 Jun to 30 Jun 2025.",
    date: "2025-05-28T09:00:00+05:30",
    read: true,
    from: "Principal's Office",
  },
];
