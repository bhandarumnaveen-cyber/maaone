import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

/** Waitlist size for the launch strip, from the waitlist_count() RPC. Null hides the count. */
export async function getWaitlistCount(): Promise<number | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data, error } = await createAnonClient().rpc("waitlist_count");
    if (error) throw error;
    const n = Number(Array.isArray(data) ? Object.values(data[0] ?? {})[0] : data);
    return Number.isFinite(n) ? n : null;
  } catch (e) {
    console.error("[waitlist_count]", e);
    return null;
  }
}
