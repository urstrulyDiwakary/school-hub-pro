// Real school data (Lovable Cloud): students, child codes, attendance,
// results, announcements and parent <-> staff messages.
import { supabase } from "@/integrations/supabase/client";

export const PENDING_CODE_KEY = "edutrack-pending-child-code";

export async function redeemCode(code: string) {
  const { error } = await supabase.rpc("redeem_join_code", { _code: code });
  if (error) throw new Error(error.message);
}

export async function redeemPendingCode() {
  const code = localStorage.getItem(PENDING_CODE_KEY);
  if (!code) return;
  try {
    await redeemCode(code);
  } catch {
    /* invalid or used — parent can re-enter it */
  }
  localStorage.removeItem(PENDING_CODE_KEY);
}

export function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

export const RECIPIENT_LABELS: Record<string, string> = {
  class_teacher: "Class Teacher",
  principal: "Principal",
  accounts: "Accounts Office",
  transport: "Transport Desk",
};

export const isUuid = (v?: string) => !!v && /^[0-9a-f-]{36}$/i.test(v);
