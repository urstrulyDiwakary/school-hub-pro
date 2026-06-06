import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PortalState {
  /** Currently selected child (parent portal multi-child support). */
  selectedStudentId: string | null;
  setSelectedStudent: (id: string) => void;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      selectedStudentId: null,
      setSelectedStudent: (id) => set({ selectedStudentId: id }),
    }),
    { name: "edutrack-portal", storage: createJSONStorage(() => localStorage) },
  ),
);
