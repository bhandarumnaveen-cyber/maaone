import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Logs out. Form field scope=global ends the session on every device. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const scope = form?.get("scope") === "global" ? "global" : "local";
  const supabase = await createClient();
  await supabase.auth.signOut({ scope });
  return NextResponse.redirect(new URL("/login?signedout=1", req.url), { status: 303 });
}
