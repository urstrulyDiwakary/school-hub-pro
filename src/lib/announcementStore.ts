// Announcement / alert broadcast store.
// Management & teachers publish holidays, alerts, events and notices here;
// every portal (admin, teacher, parent, student) reads from the same source.
// Persisted in localStorage so broadcasts survive refresh — swap the read/write
// helpers for API calls when a backend is connected.

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Role } from "@/lib/auth/types";
import { useAuthStore } from "@/lib/auth/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeInvalidate } from "@/hooks/useLiveSchool";

export type AnnouncementCategory = "holiday" | "alert" | "event" | "notice" | "exam";
export type AnnouncementAudience = "all" | "teachers" | "parents" | "students" | "staff";
export type AnnouncementChannel = "in_app" | "sms" | "email" | "whatsapp";

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  message: string;
  audiences: AnnouncementAudience[];
  channels: AnnouncementChannel[];
  createdAt: string;
  createdBy: string;
  pinned?: boolean;
  /** Optional date the notice refers to (e.g. the holiday date). */
  effectiveDate?: string;
}

const STORAGE_KEY = "edutrack.announcements.v1";
const READ_KEY = "edutrack.announcements.read.v1";
const EVENT = "edutrack:announcements";

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  holiday: "Holiday",
  alert: "Alert",
  event: "Event",
  notice: "Notice",
  exam: "Exam",
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: "Everyone",
  teachers: "Teachers",
  parents: "Parents",
  students: "Students",
  staff: "Staff",
};

const seed: Announcement[] = [
  {
    id: "ANN-1",
    category: "holiday",
    title: "Holiday — Independence Day",
    message:
      "The school will remain closed on 15 August for Independence Day. Flag hoisting at 8:00 AM is optional for students of classes 6-12.",
    audiences: ["all"],
    channels: ["in_app", "sms"],
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    createdBy: "Principal's Office",
    pinned: true,
    effectiveDate: "2026-08-15",
  },
  {
    id: "ANN-2",
    category: "alert",
    title: "Heavy rain alert — early dispatch",
    message:
      "Due to a heavy rain warning, buses will leave at 1:30 PM today. Parents picking up children are requested to arrive by 1:15 PM.",
    audiences: ["parents", "teachers"],
    channels: ["in_app", "sms", "whatsapp"],
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    createdBy: "Transport Desk",
  },
  {
    id: "ANN-3",
    category: "event",
    title: "Parent-Teacher Meeting",
    message: "PTM for classes 6-10 on 30 August, 10:00 AM - 1:00 PM in the main auditorium.",
    audiences: ["parents"],
    channels: ["in_app", "email"],
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    createdBy: "Academic Coordinator",
    effectiveDate: "2026-08-30",
  },
];

function read(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Announcement[];
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function write(items: Announcement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  window.dispatchEvent(new Event(EVENT));
}

function readRead(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export const announcementStore = {
  list(): Announcement[] {
    return read().sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  },
  publish(input: Omit<Announcement, "id" | "createdAt">): Announcement {
    const liveUser = useAuthStore.getState().user;
    if (liveUser?.live) {
      void supabase.from("announcements").insert({
        category: input.category, title: input.title, message: input.message,
        audiences: input.audiences, channels: input.channels, pinned: !!input.pinned,
        effective_date: input.effectiveDate ?? null, created_by: liveUser.id, created_by_name: input.createdBy,
      }).then(() => window.dispatchEvent(new Event(EVENT)));
      return { ...input, id: "pending", createdAt: new Date().toISOString() };
    }
    const item: Announcement = {
      ...input,
      id: `ANN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    write([item, ...read()]);
    return item;
  },
  remove(id: string) {
    if (useAuthStore.getState().user?.live) {
      void supabase.from("announcements").delete().eq("id", id).then(() => window.dispatchEvent(new Event(EVENT)));
      return;
    }
    write(read().filter((a) => a.id !== id));
  },
  readIds: readRead,
  markRead(id: string) {
    const ids = new Set(readRead());
    ids.add(id);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  },
  markAllRead() {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(read().map((a) => a.id)));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  },
  subscribe(listener: () => void) {
    window.addEventListener(EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  },
};

/** Which audience buckets a role belongs to. */
export function audiencesForRole(role?: Role): AnnouncementAudience[] {
  switch (role) {
    case "teacher":
      return ["all", "teachers", "staff"];
    case "parent":
      return ["all", "parents"];
    case "student":
      return ["all", "students"];
    case "accountant":
      return ["all", "staff"];
    default:
      return ["all", "teachers", "parents", "students", "staff"];
  }
}

/** Roles allowed to broadcast announcements. */
export function canBroadcast(role?: Role): boolean {
  return role === "super_admin" || role === "school_admin" || role === "teacher";
}

/** Live announcements scoped to the given role, plus unread bookkeeping. */
export function useAnnouncements(role?: Role) {
  const [tick, setTick] = useState(0);
  useEffect(() => announcementStore.subscribe(() => setTick((t) => t + 1)), []);

  const isLive = !!useAuthStore((s) => s.user?.live);
  const liveQ = useQuery({
    queryKey: ["live-announcements"],
    enabled: isLive,
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase.from("announcements").select("*")
        .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id, category: r.category as AnnouncementCategory, title: r.title, message: r.message,
        audiences: r.audiences as AnnouncementAudience[], channels: r.channels as AnnouncementChannel[],
        createdAt: r.created_at, createdBy: r.created_by_name, pinned: r.pinned,
        effectiveDate: r.effective_date ?? undefined,
      }));
    },
  });
  useRealtimeInvalidate(["announcements"], [["live-announcements"]], isLive);
  useEffect(() => {
    if (isLive) void liveQ.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const buckets = audiencesForRole(role);
  const items = (isLive ? liveQ.data ?? [] : announcementStore.list())
    .filter((a) => a.audiences.some((aud) => buckets.includes(aud)));
  const readIds = announcementStore.readIds();
  const unread = items.filter((a) => !readIds.includes(a.id));

  return {
    items,
    unread,
    unreadCount: unread.length,
    isRead: (id: string) => readIds.includes(id),
    markRead: announcementStore.markRead,
    markAllRead: () => {
      const ids = new Set([...readIds, ...items.map((a) => a.id)]);
      try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
      window.dispatchEvent(new Event(EVENT));
    },
    remove: announcementStore.remove,
    publish: announcementStore.publish,
    /** changes on every store mutation — useful as a render key */
    version: tick,
  };
}
