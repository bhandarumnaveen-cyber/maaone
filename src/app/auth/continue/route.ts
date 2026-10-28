import { redirectTo } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

/** Where to land after login when no page was requested: admins go to /admin, everyone else to /account. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectTo("/login");
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return redirectTo(data?.is_admin ? "/admin" : "/account");
}
