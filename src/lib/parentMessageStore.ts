import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Demo-only: messages are kept on this device until real parent accounts exist.
export interface ParentMessage {
  id: string;
  studentId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface State {
  messages: ParentMessage[];
  send: (m: Omit<ParentMessage, "id" | "sentAt">) => void;
}

export const useParentMessages = create<State>()(
  persist(
    (set) => ({
      messages: [],
      send: (m) =>
        set((s) => ({
          messages: [{ ...m, id: crypto.randomUUID(), sentAt: new Date().toISOString() }, ...s.messages],
        })),
    }),
    { name: "edutrack-parent-messages", storage: createJSONStorage(() => localStorage) },
  ),
);
