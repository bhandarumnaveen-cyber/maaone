import { after, NextResponse } from "next/server";
import { badRequest, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { emailForUser, getPlanRecord, priceFor, sendPlanChangedEmail, syncSubscription } from "@/lib/billing";
import { razorpay, RazorpayError, unixToIso } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Upgrades apply now (Razorpay charges the difference); downgrades apply at the next renewal. */
export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const db = createAdminClient();
  const period = body.period === "yearly" ? "yearly" : "monthly";
  const target = typeof body.plan === "string" ? await getPlanRecord(db, body.plan) : null;
  if (!target) return fail("Please choose a plan.");
  const targetRzp = period === "yearly" ? target.razorpay_plan_id_yearly : target.razorpay_plan_id_monthly;
  if (!targetRzp) return fail("That plan isn't available yet.", 503);

  const { data: sub } = await db
    .from("subscriptions")
    .select("id, status, plan_code, billing_period, razorpay_subscription_id")
    .eq("user_id", user.id)
    .in("status", ["authenticated", "active"])
    .maybeSingle();
  if (!sub?.razorpay_subscription_id) return fail("No active subscription to change.", 404);
  if (sub.status !== "active") {
    return fail("You can change plans once your free trial ends. To switch now, cancel and start again on the new plan.", 409);
  }
  if (sub.plan_code === target.code && sub.billing_period === period) return fail("You're already on this plan.");

  const current = await getPlanRecord(db, sub.plan_code);
  const monthly = (p: NonNullable<typeof current>, per: "monthly" | "yearly") => priceFor(p, per) / (per === "yearly" ? 12 : 1);
  const upgrade = !current || monthly(target, period) > monthly(current, sub.billing_period);

  try {
    const updated = await razorpay.updateSubscription(sub.razorpay_subscription_id, {
      plan_id: targetRzp,
      schedule_change_at: upgrade ? "now" : "cycle_end",
      customer_notify: 1,
    });
    if (upgrade) await syncSubscription(db, updated);
    after(async () =>
      sendPlanChangedEmail((await emailForUser(db, user.id, user.email)) ?? "", {
        from: current?.name ?? sub.plan_code,
        to: target.name,
        period,
        when: upgrade ? "now" : "renewal",
        date: unixToIso(updated.current_end),
      }),
    );
    return NextResponse.json({ ok: true, when: upgrade ? "now" : "renewal" });
  } catch (e) {
    if (e instanceof RazorpayError) return fail(e.message, 502);
    return serverError("change plan", e);
  }
}
