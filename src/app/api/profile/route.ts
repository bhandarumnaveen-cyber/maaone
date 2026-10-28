import { NextResponse } from "next/server";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { normalisePhone } from "@/lib/validation";

/** Updates the logged-in user's name and phone (the only profile columns users may change). */
export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const fullName = typeof body.full_name === "string" ? body.full_name.trim().slice(0, 120) : "";
  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const errors: Record<string, string> = {};
  if (fullName.length < 2) errors.full_name = "Please enter your name.";
  const phone = rawPhone ? normalisePhone(rawPhone) : null;
  if (rawPhone && !phone) errors.phone = "Please enter a valid mobile number or leave it blank.";
  if (Object.keys(errors).length) return invalid(errors);

  const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
  if (error) return serverError("profile", error);
  return NextResponse.json({ ok: true });
}
