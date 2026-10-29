import { after, NextResponse } from "next/server";
import { serverError } from "@/lib/api";
import { LIVE_STATUSES, requireUser } from "@/lib/auth";
import { emailForUser, sendCancelledEmail, syncSubscription } from "@/lib/billing";
import { razorpay, RazorpayError, unixToIso } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

/** Trial or unpaid: cancel now. Paid: cancel at the end of the period already paid for. */
export async function POST() {
  const { user, response } = await requireUser();
  if (!user) return response;
  const db = createAdminClient();
  const { data: sub } = await db
    .from("subscriptions")
    .select("id, status, razorpay_subscription_id")
    .eq("user_id", user.id)
    .in("status", LIVE_STATUSES)
    .maybeSingle();
  if (!sub?.razorpay_subscription_id) {
    return NextResponse.json({ ok: false, error: "No active subscription found." }, { status: 404 });
  }

  const atCycleEnd = sub.status === "active";
  try {
    const updated = await razorpay.cancelSubscription(sub.razorpay_subscription_id, atCycleEnd);
    await syncSubscription(db, updated);
    if (atCycleEnd) {
      await db.from("subscriptions").update({ cancel_at_period_end: true }).eq("id", sub.id);
      after(async () => sendCancelledEmail((await emailForUser(db, user.id, user.email)) ?? "", unixToIso(updated.current_end), true));
    }
    return NextResponse.json({ ok: true, atCycleEnd });
  } catch (e) {
    if (e instanceof RazorpayError) return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
    return serverError("cancel subscription", e);
  }
}
