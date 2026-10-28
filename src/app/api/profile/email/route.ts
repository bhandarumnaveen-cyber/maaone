import { NextResponse } from "next/server";
import { badRequest, invalid, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { site } from "@/site.config";

/** Starts an email change; Supabase emails a confirmation link before it takes effect. */
export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return invalid({ email: "Please enter a valid email address." });
  if (email === user.email) return invalid({ email: "That's already your email address." });

  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${site.url}/login` });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
