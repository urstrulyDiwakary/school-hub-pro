// Bridges real accounts (Lovable Cloud auth) into the shared auth store.
// Demo accounts keep working; real accounts are flagged with `live: true`.
import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "./authStore";
import type { AuthUser, Role } from "./types";

const ROLE_PRIORITY: Role[] = ["school_admin", "teacher", "accountant", "parent", "student"];

export async function loadLiveUser(session: Session): Promise<AuthUser | null> {
  const uid = session.user.id;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", uid),
    supabase.from("profiles").select("full_name,email").eq("id", uid).maybeSingle(),
  ]);
  const owned = (roles ?? []).map((r) => r.role as Role);
  const role = ROLE_PRIORITY.find((r) => owned.includes(r));
  if (!role) return null;
  const name = profile?.full_name || session.user.email?.split("@")[0] || "User";
  return {
    id: uid,
    name,
    email: profile?.email || session.user.email || "",
    role,
    initials: name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    live: true,
  };
}

export function AuthBridge() {
  useEffect(() => {
    const apply = (session: Session | null) => {
      const { user, setUser, clear } = useAuthStore.getState();
      if (!session) {
        if (user?.live) clear();
        return;
      }
      // Defer DB reads out of the auth callback.
      setTimeout(async () => {
        const live = await loadLiveUser(session);
        if (live) setUser(live);
      }, 0);
    };
    const { data } = supabase.auth.onAuthStateChange((_e, s) => apply(s));
    supabase.auth.getSession().then(({ data: { session } }) => apply(session));
    return () => data.subscription.unsubscribe();
  }, []);
  return null;
}
