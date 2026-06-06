// Notification service: filter by audience, unread counts and grouping.

import { notifications, type Notification, type Audience, type NotificationType } from "@/data/portal/notifications";

export const notificationService = {
  getForAudience(audience: Exclude<Audience, "all">): Notification[] {
    return notifications
      .filter((n) => n.audience === "all" || n.audience === audience)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  getUnreadCount(audience: Exclude<Audience, "all">): number {
    return this.getForAudience(audience).filter((n) => !n.read).length;
  },

  getByType(audience: Exclude<Audience, "all">, type: NotificationType): Notification[] {
    return this.getForAudience(audience).filter((n) => n.type === type);
  },
};
