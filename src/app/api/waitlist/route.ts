import { NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson, serverError } from "@/lib/api";
import { validateWaitlist } from "@/lib/validation";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getPlans } from "@/lib/settings";

type JoinResult = { waitlist_position: number; total_on_waitlist: number; already_joined: boolean };

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors, data } = validateWaitlist(body);
  if (!ok) return invalid(errors);
  if (!supabaseConfigured) return NextResponse.json({ ok: true, preview: true });

  // plan_interest references plans(code); anything else is stored as "not sure".
  const plans = await getPlans();
  const planInterest = plans.some((p) => p.code === data.plan) ? data.plan : null;

  const { data: rows, error } = await createAnonClient().rpc("join_waitlist", {
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone,
    p_business_name: data.businessName,
    p_business_type: data.businessType,
    p_city: data.city,
    p_plan_interest: planInterest,
    p_source: "website",
  });
  if (error) return serverError("join_waitlist", error);

  const result = (rows as JoinResult[] | null)?.[0];
  return NextResponse.json({
    ok: true,
    position: result ? Number(result.waitlist_position) : undefined,
    alreadyJoined: result?.already_joined ?? false,
  });
}
