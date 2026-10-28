import "server-only";
import { createClient } from "@/lib/supabase/server";

/** The logged-in user's auth record and profile row, for the profile pages. */
export async function loadProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("full_name, phone, created_at").eq("id", user.id).maybeSingle();
  return { user, profile };
}
