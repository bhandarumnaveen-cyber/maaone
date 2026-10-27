import { NextResponse } from "next/server";
import { badRequest, readJson, serverError } from "@/lib/api";
import { LIVE_STATUSES, requireUser } from "@/lib/auth";
import { getPlanRecord, priceFor } from "@/lib/billing";
import { razorpay, razorpayConfigured, razorpayKeyId, RazorpayError } from "@/lib/razorpay";
import { getSettings } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/site.config";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Creates (or reuses) a Razorpay subscription for the chosen plan and returns checkout options. */
export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const settings = await getSettings();
  if (!settings.salesOpen) return fail("Subscriptions open on launch day. Please join the waitlist.", 403);
  if (!razorpayConfigured()) return fail("Payments are not set up yet. Please try again soon.", 503);

  const period = body.period === "yearly" ? "yearly" : "monthly";
  const db = createAdminClient();
  const plan = typeof body.plan === "string" ? await getPlanRecord(db, body.plan) : null;
  if (!plan) return fail("Please choose a plan.");
  const rzpPlanId = period === "yearly" ? plan.razorpay_plan_id_yearly : plan.razorpay_plan_id_monthly;
  if (!rzpPlanId) return fail("This plan isn't available for checkout yet. Please contact us.", 503);

  const { data: billing } = await supabase.from("billing_details").select("business_name").eq("user_id", user.id).maybeSingle();
  if (!billing) return fail("Please add your billing details first.");

  const { data: subs } = await db
    .from("subscriptions")
    .select("id, status, plan_code, billing_period, razorpay_subscription_id, trial_ends_at")
    .eq("user_id", user.id);
  const live = (subs ?? []).find((s) => LIVE_STATUSES.includes(s.status));

  try {
    let subscriptionId: string | null = null;
    if (live && live.status !== "created") {
      return fail("You already have a subscription. Manage it from your account.", 409);
    }
    if (live) {
      // An abandoned checkout: reuse it for the same plan, otherwise cancel it so a new one can start.
      const same = live.plan_code === plan.code && live.billing_period === period;
      const remote = live.razorpay_subscription_id
        ? await razorpay.fetchSubscription(live.razorpay_subscription_id).catch(() => null)
        : null;
      if (same && remote?.status === "created") {
        subscriptionId = remote.id;
      } else {
        if (remote?.status === "created") await razorpay.cancelSubscription(remote.id, false).catch(() => null);
        // Never paid or authorised, so it doesn't use up the customer's free trial.
        await db
          .from("subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString(), trial_ends_at: null })
          .eq("id", live.id);
      }
    }

    if (!subscriptionId) {
      // One free trial per customer: only on their first subscription.
      const hadTrial = (subs ?? []).some((s) => s.trial_ends_at && s.id !== live?.id);
      const trialEnds = hadTrial ? null : new Date(Date.now() + settings.trialDays * 86_400_000);
      const created = await razorpay.createSubscription({
        plan_id: rzpPlanId,
        total_count: period === "yearly" ? 10 : 120,
        customer_notify: 1,
        ...(trialEnds ? { start_at: Math.floor(trialEnds.getTime() / 1000) } : {}),
        notes: { user_id: user.id, plan_code: plan.code, billing_period: period },
      });
      const { error } = await db.from("subscriptions").insert({
        user_id: user.id,
        plan_code: plan.code,
        billing_period: period,
        currency: "INR",
        amount: priceFor(plan, period),
        status: "created",
        razorpay_subscription_id: created.id,
        trial_ends_at: trialEnds?.toISOString() ?? null,
      });
      if (error) throw error;
      subscriptionId = created.id;
    }

    return NextResponse.json({
      ok: true,
      keyId: razorpayKeyId(),
      subscriptionId,
      name: site.company,
      description: `${site.name} ${plan.name} (${period})`,
      prefill: { name: billing.business_name, email: user.email ?? undefined, contact: user.phone ?? undefined },
    });
  } catch (e) {
    if (e instanceof RazorpayError) return fail(e.message, 502);
    return serverError("checkout", e);
  }
}
