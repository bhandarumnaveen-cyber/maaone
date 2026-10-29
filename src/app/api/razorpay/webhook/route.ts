import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/format";
import { site } from "@/site.config";
import { razorpay, razorpayConfigured, verifyWebhookSignature, type RzpPayment, type RzpSubscription } from "@/lib/razorpay";
import {
  emailForUser,
  getPlanRecord,
  issueInvoiceWithPdf,
  recordPayment,
  sendAdminAlert,
  sendCancelledEmail,
  sendInvoiceEmail,
  sendPaymentFailedEmail,
  sendTrialStartedEmail,
  syncSubscription,
  unixToIstDate,
  type SubscriptionRow,
} from "@/lib/billing";

export const runtime = "nodejs";

type RazorpayEvent = {
  event: string;
  created_at: number;
  payload: {
    subscription?: { entity: RzpSubscription };
    payment?: { entity: RzpPayment };
  };
};

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const db = createAdminClient();
  const eventId = req.headers.get("x-razorpay-event-id") ?? `${event.event}:${event.created_at}:${raw.length}`;

  // 1. Save the event first; a duplicate (Razorpay retry) is acknowledged and skipped.
  const { data: saved, error: saveErr } = await db
    .from("webhook_events")
    .upsert(
      { provider: "razorpay", event_id: eventId, event_type: event.event, payload: event },
      { onConflict: "provider,event_id", ignoreDuplicates: true },
    )
    .select("id");
  if (saveErr) {
    console.error("[webhook] save", saveErr);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!saved?.length) {
    // Already stored. Re-process only if the earlier attempt failed.
    const { data: prev } = await db
      .from("webhook_events")
      .select("id, processed_at")
      .eq("provider", "razorpay")
      .eq("event_id", eventId)
      .single();
    if (!prev || prev.processed_at) return NextResponse.json({ ok: true, duplicate: true });
    return processEvent(db, prev.id, event);
  }
  return processEvent(db, saved[0].id, event);
}

async function processEvent(db: ReturnType<typeof createAdminClient>, rowId: string, event: RazorpayEvent) {
  try {
    await handle(db, event);
    await db.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null }).eq("id", rowId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : JSON.stringify(e);
    console.error("[webhook]", event.event, message);
    await db.from("webhook_events").update({ error: message.slice(0, 2000) }).eq("id", rowId);
    // 500 makes Razorpay retry; the stored row lets the retry pick up where this failed.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handle(db: ReturnType<typeof createAdminClient>, event: RazorpayEvent) {
  const subEntity = event.payload.subscription?.entity;
  const payEntity = event.payload.payment?.entity;

  let sub: SubscriptionRow | null = null;
  let previousStatus: string | undefined;
  if (subEntity) ({ row: sub, previousStatus } = await syncSubscription(db, subEntity));

  switch (event.event) {
    case "subscription.authenticated": {
      if (sub && previousStatus !== "authenticated" && sub.trial_ends_at) {
        const to = await emailForUser(db, sub.user_id);
        const plan = await getPlanRecord(db, sub.plan_code);
        if (to) await sendTrialStartedEmail(to, plan, sub);
        await sendAdminAlert({
          subject: `New trial: ${plan?.name ?? sub.plan_code}`,
          heading: "A new customer started a free trial",
          rows: [
            ["Customer", to ?? "—"],
            ["Plan", `${plan?.name ?? sub.plan_code} · ${sub.billing_period}`],
            ["Trial ends", sub.trial_ends_at?.slice(0, 10) ?? "—"],
          ],
          link: { label: "Open subscribers", href: `${site.url}/admin/subscribers` },
        });
      }
      return;
    }

    case "subscription.charged": {
      if (!sub || !payEntity) return;
      const payment = await recordPayment(db, payEntity, sub);
      if (payment.status !== "captured") return;
      const { count } = await db
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("subscription_id", sub.id);
      const plan = await getPlanRecord(db, sub.plan_code);
      const description = `${plan?.name ?? sub.plan_code} plan, ${sub.billing_period} subscription (Maa One)`;
      const { invoice, pdf } = await issueInvoiceWithPdf(
        db,
        payment.id,
        description,
        unixToIstDate(subEntity?.current_start),
        unixToIstDate(subEntity?.current_end),
      );
      const to = await emailForUser(db, sub.user_id, payEntity.email);
      if (to)
        await sendInvoiceEmail(to, invoice, pdf, (count ?? 0) === 0, {
          planName: plan?.name ?? sub.plan_code,
          period: sub.billing_period,
          nextDate: sub.current_period_end,
        });
      await sendAdminAlert({
        subject: `Payment received: ${formatMoney(invoice.total, invoice.currency)}`,
        heading: (count ?? 0) === 0 ? "First payment from a new customer" : "Subscription payment received",
        rows: [
          ["Customer", to ?? "—"],
          ["Amount", formatMoney(invoice.total, invoice.currency)],
          ["Invoice", invoice.invoice_number],
          ["Plan", `${plan?.name ?? sub.plan_code} · ${sub.billing_period}`],
        ],
        link: { label: "Open subscribers", href: `${site.url}/admin/subscribers` },
      });
      return;
    }

    case "subscription.pending":
    case "subscription.halted": {
      if (sub && previousStatus !== sub.status) {
        const to = await emailForUser(db, sub.user_id);
        if (to) await sendPaymentFailedEmail(to);
      }
      return;
    }

    case "subscription.cancelled": {
      if (sub && previousStatus !== "cancelled") {
        const to = await emailForUser(db, sub.user_id);
        if (to) await sendCancelledEmail(to, sub.current_period_end);
      }
      return;
    }

    case "payment.failed": {
      if (!payEntity) return;
      // Link the failed charge to its subscription through the Razorpay invoice, when possible.
      let linked: SubscriptionRow | null = null;
      if (payEntity.invoice_id && razorpayConfigured()) {
        const rzpInvoice = await razorpay.fetchInvoice(payEntity.invoice_id).catch(() => null);
        if (rzpInvoice?.subscription_id) {
          const { data } = await db
            .from("subscriptions")
            .select("*")
            .eq("razorpay_subscription_id", rzpInvoice.subscription_id)
            .maybeSingle();
          linked = data as SubscriptionRow | null;
        }
      }
      if (linked) await recordPayment(db, payEntity, linked);
      return;
    }

    default:
      // activated, updated, completed, paused, resumed: syncSubscription above is all that's needed.
      return;
  }
}
