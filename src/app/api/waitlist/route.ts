import { NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson, serverError } from "@/lib/api";
import { validateWaitlist } from "@/lib/validation";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

/** join_waitlist may return a bare number, a row, or a one-row set. */
function extractPosition(data: unknown): number | undefined {
  const row = Array.isArray(data) ? data[0] : data;
  if (typeof row === "number") return row;
  if (row && typeof row === "object" && "waitlist_position" in row) {
    const n = Number((row as { waitlist_position: unknown }).waitlist_position);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors, data } = validateWaitlist(body);
  if (!ok) return invalid(errors);
  if (!supabaseConfigured) return NextResponse.json({ ok: true, preview: true });

  const { data: result, error } = await createAnonClient().rpc("join_waitlist", {
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone,
    p_business_name: data.businessName,
    p_business_type: data.businessType,
    p_city: data.city,
    p_plan_interest: data.plan,
    p_source: "website",
  });
  if (error) return serverError("join_waitlist", error);

  return NextResponse.json({ ok: true, position: extractPosition(result) });
}
