import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** For API routes: the logged-in user and an RLS-bound client, or a 401 response. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, supabase, response: NextResponse.json({ ok: false, error: "Please log in again." }, { status: 401 }) };
  }
  return { user, supabase, response: null };
}

export const LIVE_STATUSES = ["created", "authenticated", "active", "pending", "halted", "paused"];
