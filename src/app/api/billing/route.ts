import { NextResponse } from "next/server";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { indianStates } from "@/lib/states";
import { validateBilling } from "@/lib/validation";

/** Saves the logged-in user's billing details (used on GST invoices). */
export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const { ok, errors, data } = validateBilling(body, indianStates);
  if (!ok) return invalid(errors);
  const row = {
    ...data,
    gstin: data.gstin || null,
    address_line2: data.address_line2 || null,
    country: "IN",
  };

  const { data: existing } = await supabase.from("billing_details").select("user_id").eq("user_id", user.id).maybeSingle();
  const { error } = existing
    ? await supabase.from("billing_details").update(row).eq("user_id", user.id)
    : await supabase.from("billing_details").insert(row);
  if (error) return serverError("billing_details", error);
  return NextResponse.json({ ok: true });
}
