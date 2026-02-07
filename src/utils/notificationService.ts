/**
 * Notification service stub for SMS/email alerts.
 * 
 * This module provides a preparatory interface for sending notifications
 * when students are marked absent. Connect your SMS gateway (e.g., Twilio,
 * MSG91) or email service here when backend is available.
 * 
 * Usage:
 *   import { notifyAbsentStudent } from "@/utils/notificationService";
 *   notifyAbsentStudent({ studentName, className, date });
 */

export interface AbsentNotification {
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  parentContact?: string;
  parentEmail?: string;
}

/**
 * Queue of notifications pending dispatch.
 * In production, this would be sent to an edge function / API endpoint.
 */
const pendingNotifications: AbsentNotification[] = [];

/**
 * Send an absence notification to a student's parent.
 * Currently logs to console — replace with API call when backend is connected.
 */
export function notifyAbsentStudent(notification: AbsentNotification): void {
  pendingNotifications.push(notification);
  console.log(
    `[NotificationService] Queued absence alert for ${notification.studentName} (${notification.className}) on ${notification.date}`
  );
}

/**
 * Batch-send all pending notifications.
 * Call this after saving attendance to dispatch all alerts at once.
 * Returns the count of notifications sent.
 */
export function dispatchPendingNotifications(): number {
  const count = pendingNotifications.length;
  if (count > 0) {
    console.log(
      `[NotificationService] Dispatching ${count} absence notification(s)...`
    );
    // TODO: Replace with actual API call:
    // await supabase.functions.invoke('send-absence-notifications', {
    //   body: { notifications: pendingNotifications }
    // });
    pendingNotifications.length = 0;
  }
  return count;
}

/**
 * Get the current count of pending notifications.
 */
export function getPendingNotificationCount(): number {
  return pendingNotifications.length;
}
