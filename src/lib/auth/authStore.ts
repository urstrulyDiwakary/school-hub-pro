// Zustand auth store with localStorage session persistence.
// Single source of truth for the signed-in user across the app.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "./types";
import { authenticate } from "./mockUsers";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => AuthUser | null;
  /** Directly set a user (e.g. real account session or demo). */
  setUser: (user: AuthUser) => void;
  /** Clear local state without contacting the server. */
  clear: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        const user = authenticate(email, password);
        if (user) set({ user, isAuthenticated: true });
        return user;
      },
      setUser: (user) => set({ user, isAuthenticated: true }),
      clear: () => set({ user: null, isAuthenticated: false }),
      logout: () => {
        if (get().user?.live) void supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "edutrack-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
