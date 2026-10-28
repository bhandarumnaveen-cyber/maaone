import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Where to land after login when no page was requested: admins go to /admin, everyone else to /account. */
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return NextResponse.redirect(new URL(data?.is_admin ? "/admin" : "/account", req.url));
}
