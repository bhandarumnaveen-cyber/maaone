import { NextResponse } from "next/server";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { validateTicket } from "@/lib/validation";

export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();
  const { ok, errors, data } = validateTicket(body);
  if (!ok) return invalid(errors);
  const { error } = await supabase.from("support_tickets").insert(data);
  if (error) return serverError("support_tickets", error);
  return NextResponse.json({ ok: true });
}
