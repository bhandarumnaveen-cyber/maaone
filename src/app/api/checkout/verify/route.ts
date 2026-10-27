import { NextResponse } from "next/server";
import { badRequest, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { syncSubscription } from "@/lib/billing";
import { razorpay, verifyCheckoutSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

/** Called by the checkout handler. The webhook remains the source of truth; this just updates the page quickly. */
export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const paymentId = String(body.razorpay_payment_id ?? "");
  const subscriptionId = String(body.razorpay_subscription_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  if (!verifyCheckoutSignature(paymentId, subscriptionId, signature)) {
    return NextResponse.json({ ok: false, error: "Payment could not be verified." }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: own } = await db
    .from("subscriptions")
    .select("id")
    .eq("razorpay_subscription_id", subscriptionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!own) return NextResponse.json({ ok: false, error: "Subscription not found." }, { status: 404 });

  try {
    await syncSubscription(db, await razorpay.fetchSubscription(subscriptionId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError("checkout verify", e);
  }
}
