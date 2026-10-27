import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailForUser, getPlanRecord, sendRenewalReminderEmail } from "@/lib/billing";

/**
 * Daily (vercel.json). Reminds customers before a renewal:
 * monthly plans 3 days ahead, yearly plans 7 days ahead. Each run covers a
 * 24-hour window, so every renewal gets exactly one reminder.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = createAdminClient();
  const day = 86_400_000;
  let sent = 0;

  for (const [period, daysAhead] of [["monthly", 3], ["yearly", 7]] as const) {
    const from = new Date(Date.now() + daysAhead * day);
    const to = new Date(from.getTime() + day);
    const { data, error } = await db
      .from("subscriptions")
      .select("user_id, plan_code, amount, current_period_end")
      .eq("status", "active")
      .eq("billing_period", period)
      .eq("cancel_at_period_end", false)
      .gte("current_period_end", from.toISOString())
      .lt("current_period_end", to.toISOString());
    if (error) {
      console.error("[renewal reminders]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    for (const s of data ?? []) {
      const email = await emailForUser(db, s.user_id);
      if (!email || !s.current_period_end) continue;
      const plan = await getPlanRecord(db, s.plan_code);
      await sendRenewalReminderEmail(email, plan?.name ?? s.plan_code, s.amount, s.current_period_end);
      sent++;
    }
  }
  return NextResponse.json({ ok: true, sent });
}
