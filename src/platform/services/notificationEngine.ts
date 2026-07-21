// Centralized notification engine. Fan-out to channels happens here;
// today only `in_app` is real. Email/SMS/WhatsApp/Push land as no-ops
// with structured logs, ready to be wired to providers later.

import type { NotificationChannel, NotificationCategory, NotificationMessage } from "../types";

const store: NotificationMessage[] = [];
type Listener = (n: NotificationMessage) => void;
const listeners = new Set<Listener>();

export interface SendInput {
  category: NotificationCategory;
  title: string;
  body: string;
  channels?: NotificationChannel[];
  targetUserId: string;
  actorId?: string;
  link?: string;
}

export const notificationEngine = {
  async send(input: SendInput): Promise<NotificationMessage> {
    const msg: NotificationMessage = {
      id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      channels: input.channels ?? ["in_app"],
      ...input,
    };
    store.unshift(msg);
    listeners.forEach((l) => l(msg));

    // Channel adapters (placeholders — replace with real providers).
    for (const ch of msg.channels) {
      if (ch === "in_app") continue;
      // eslint-disable-next-line no-console
      console.debug(`[notify:${ch}] -> ${msg.targetUserId}`, msg.title);
    }
    return msg;
  },
  list(userId?: string): NotificationMessage[] {
    return userId ? store.filter((m) => m.targetUserId === userId) : [...store];
  },
  markRead(id: string) {
    const m = store.find((x) => x.id === id);
    if (m) m.readAt = new Date().toISOString();
  },
  subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); },
};
