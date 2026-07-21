// Reusable audit infrastructure. Every mutating action in the app
// should call `auditService.record(...)`. In-memory buffer for now;
// switch to POST /audit-events when backend arrives.

import type { AuditEvent } from "../types";

const buffer: AuditEvent[] = [];
type Listener = (e: AuditEvent) => void;
const listeners = new Set<Listener>();

function detectDevice(): { device: string; browser: string } {
  if (typeof navigator === "undefined") return { device: "server", browser: "n/a" };
  const ua = navigator.userAgent;
  const device = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "Other";
  return { device, browser };
}

export const auditService = {
  record(event: Omit<AuditEvent, "id" | "timestamp" | "device" | "browser">): AuditEvent {
    const { device, browser } = detectDevice();
    const full: AuditEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      device,
      browser,
      ip: event.ip ?? "0.0.0.0",
    };
    buffer.unshift(full);
    if (buffer.length > 500) buffer.length = 500;
    listeners.forEach((l) => l(full));
    return full;
  },
  list(filter?: Partial<Pick<AuditEvent, "entity" | "entityId" | "userId" | "action">>): AuditEvent[] {
    if (!filter) return [...buffer];
    return buffer.filter((e) =>
      Object.entries(filter).every(([k, v]) => (e as Record<string, unknown>)[k] === v),
    );
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  clear() { buffer.length = 0; },
};
