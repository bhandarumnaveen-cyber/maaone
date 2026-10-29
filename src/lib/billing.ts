import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminAlertAddress, getBrand, sendEmail } from "./email";
import {
  adminAlertEmail,
  cancelledEmail,
  istDate,
  paymentFailedEmail,
  paymentReceivedEmail,
  planChangedEmail,
  renewalReminderEmail,
  trialStartedEmail,
  waitlistEmail,
} from "./email-templates";
import { invoicePdfPath, renderInvoicePdf, type InvoiceRow } from "./invoice-pdf";
import { unixToIso, unixToIstDate, type RzpPayment, type RzpSubscription } from "./razorpay";
import { getSettings } from "./settings";
import { formatMoney } from "./format";

type Period = "monthly" | "yearly";

export type SubscriptionRow = {
  id: string;
  user_id: string | null;
  plan_code: string;
  billing_period: Period;
  currency: "INR" | "USD";
  amount: number;
  status: string;
  razorpay_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type PlanRecord = {
  code: string;
  name: string;
  price_inr_monthly: number;
  price_inr_yearly: number;
  razorpay_plan_id_monthly: string | null;
  razorpay_plan_id_yearly: string | null;
};

const PLAN_COLUMNS = "code, name, price_inr_monthly, price_inr_yearly, razorpay_plan_id_monthly, razorpay_plan_id_yearly";

export async function getPlanRecord(db: SupabaseClient, code: string) {
  const { data } = await db.from("plans").select(PLAN_COLUMNS).eq("code", code).maybeSingle();
  return data as PlanRecord | null;
}

/** Finds the plan and billing period for a Razorpay plan id. */
export async function planForRazorpayId(db: SupabaseClient, rzpPlanId: string) {
  if (!/^plan_[A-Za-z0-9]+$/.test(rzpPlanId)) return null;
  const { data } = await db
    .from("plans")
    .select(PLAN_COLUMNS)
    .or(`razorpay_plan_id_monthly.eq.${rzpPlanId},razorpay_plan_id_yearly.eq.${rzpPlanId}`)
    .maybeSingle();
  const plan = data as PlanRecord | null;
  if (!plan) return null;
  const period: Period = plan.razorpay_plan_id_yearly === rzpPlanId ? "yearly" : "monthly";
  return { plan, period };
}

export const priceFor = (plan: PlanRecord, period: Period) =>
  period === "yearly" ? plan.price_inr_yearly : plan.price_inr_monthly;

const notesOf = (n: RzpSubscription["notes"]) => (Array.isArray(n) ? {} : n);

/** Upserts our subscriptions row from a Razorpay subscription entity. */
export async function syncSubscription(db: SupabaseClient, sub: RzpSubscription) {
  const { data: existing } = await db
    .from("subscriptions")
    .select("*")
    .eq("razorpay_subscription_id", sub.id)
    .maybeSingle();

  const match = await planForRazorpayId(db, sub.plan_id);
  const notes = notesOf(sub.notes);
  const planCode = match?.plan.code ?? existing?.plan_code ?? notes.plan_code;
  const period: Period = match?.period ?? existing?.billing_period ?? (notes.billing_period as Period) ?? "monthly";
  if (!planCode) throw new Error(`Unknown Razorpay plan ${sub.plan_id}`);

  const row = {
    user_id: existing?.user_id ?? notes.user_id ?? null,
    plan_code: planCode,
    billing_period: period,
    currency: "INR",
    amount: match ? priceFor(match.plan, period) : (existing?.amount ?? 0),
    status: sub.status,
    razorpay_subscription_id: sub.id,
    razorpay_customer_id: sub.customer_id ?? existing?.razorpay_customer_id ?? null,
    current_period_start: unixToIso(sub.current_start),
    current_period_end: unixToIso(sub.current_end),
    trial_ends_at: existing?.trial_ends_at ?? null,
    cancelled_at: sub.status === "cancelled" ? (unixToIso(sub.ended_at) ?? new Date().toISOString()) : null,
    cancel_at_period_end: sub.status === "cancelled" ? false : (existing?.cancel_at_period_end ?? false),
  };

  const { data, error } = await db
    .from("subscriptions")
    .upsert(row, { onConflict: "razorpay_subscription_id" })
    .select("*")
    .single();
  if (error) throw error;
  return { row: data as SubscriptionRow, previousStatus: existing?.status as string | undefined };
}

/** Upserts a Razorpay payment into payments. */
export async function recordPayment(db: SupabaseClient, p: RzpPayment, sub: SubscriptionRow | null) {
  const status = ["created", "authorized", "captured", "refunded", "failed"].includes(p.status) ? p.status : "failed";
  const { data, error } = await db
    .from("payments")
    .upsert(
      {
        user_id: sub?.user_id ?? null,
        subscription_id: sub?.id ?? null,
        razorpay_payment_id: p.id,
        razorpay_invoice_id: p.invoice_id,
        razorpay_order_id: p.order_id,
        amount: p.amount,
        currency: p.currency === "USD" ? "USD" : "INR",
        status,
        method: p.method,
        error_reason: p.error_description ?? p.error_reason,
        paid_at: status === "captured" ? unixToIso(p.created_at) : null,
      },
      { onConflict: "razorpay_payment_id" },
    )
    .select("id, user_id, status")
    .single();
  if (error) throw error;
  return data as { id: string; user_id: string | null; status: string };
}

export async function emailForUser(db: SupabaseClient, userId: string | null, fallback?: string | null) {
  if (userId) {
    const { data } = await db.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (data?.email) return data.email as string;
  }
  return fallback ?? null;
}

/**
 * issue_invoice() → PDF → upload to the invoices bucket → save pdf_path.
 * Safe to call again for the same payment: the RPC returns the existing invoice.
 */
export async function issueInvoiceWithPdf(
  db: SupabaseClient,
  paymentId: string,
  description: string,
  periodStart: string | null,
  periodEnd: string | null,
) {
  const { data, error } = await db.rpc("issue_invoice", {
    p_payment_id: paymentId,
    p_description: description,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  });
  if (error) throw error;
  const invoice = (Array.isArray(data) ? data[0] : data) as InvoiceRow;
  const settings = await getSettings();
  const pdf = await renderInvoicePdf(invoice, { supportEmail: settings.supportEmail, gstRate: settings.gstRate });

  if (!invoice.pdf_path) {
    const path = invoicePdfPath(invoice);
    const { error: upErr } = await db.storage
      .from("invoices")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;
    const { error: updErr } = await db.from("invoices").update({ pdf_path: path }).eq("id", invoice.id);
    if (updErr) throw updErr;
    invoice.pdf_path = path;
  }
  return { invoice, pdf };
}

/* ------------------------------------------------------------------ */
/* Customer emails (templates in email-templates.ts)                   */
/* ------------------------------------------------------------------ */

const periodLabel = (p: string) => (p === "yearly" ? "Yearly" : "Monthly");

export async function sendInvoiceEmail(
  to: string,
  invoice: InvoiceRow,
  pdf: Uint8Array,
  firstPayment: boolean,
  extra: { planName?: string; period?: string; nextDate?: string | null } = {},
) {
  const [b, s] = await Promise.all([getBrand(), getSettings()]);
  await sendEmail(
    to,
    paymentReceivedEmail(b, {
      first: firstPayment,
      amount: formatMoney(invoice.total, invoice.currency),
      invoiceNumber: invoice.invoice_number,
      planName: extra.planName ?? "Maa One",
      period: periodLabel(extra.period ?? "monthly"),
      paidOn: istDate(invoice.invoice_date) ?? invoice.invoice_date,
      nextDate: istDate(extra.nextDate),
      appUrl: s.appUrl,
      appReady: s.appReady,
    }),
    { attachments: [{ filename: `${invoice.invoice_number.replace(/\//g, "-")}.pdf`, content: pdf }] },
  );
}

export async function sendTrialStartedEmail(to: string, plan: PlanRecord | null, sub: SubscriptionRow) {
  const [b, s] = await Promise.all([getBrand(), getSettings()]);
  const amount = plan ? priceFor(plan, sub.billing_period) : sub.amount;
  await sendEmail(
    to,
    trialStartedEmail(b, {
      planName: plan?.name ?? sub.plan_code,
      trialDays: s.trialDays,
      trialEnds: sub.trial_ends_at,
      firstCharge: `${formatMoney(Math.round(amount * (1 + s.gstRate / 100)), "INR")} incl. GST`,
      appUrl: s.appUrl,
      appReady: s.appReady,
    }),
  );
}

export async function sendPaymentFailedEmail(to: string) {
  await sendEmail(to, paymentFailedEmail(await getBrand()));
}

export async function sendCancelledEmail(to: string, endsAt: string | null, scheduled = false) {
  await sendEmail(to, cancelledEmail(await getBrand(), { endsAt, scheduled }));
}

export async function sendRenewalReminderEmail(to: string, planName: string, amount: number, renewsOn: string) {
  const [b, s] = await Promise.all([getBrand(), getSettings()]);
  await sendEmail(
    to,
    renewalReminderEmail(b, {
      planName,
      amount: formatMoney(Math.round(amount * (1 + s.gstRate / 100)), "INR"),
      date: istDate(renewsOn) ?? renewsOn,
    }),
  );
}

export async function sendWaitlistEmail(to: string, name: string, position: number | undefined) {
  const [b, s] = await Promise.all([getBrand(), getSettings()]);
  await sendEmail(to, waitlistEmail(b, { name, position, launchDateLabel: s.launchDateLabel, trialDays: s.trialDays }));
}

export async function sendPlanChangedEmail(to: string, o: { from: string; to: string; period: string; when: "now" | "renewal"; date?: string | null }) {
  await sendEmail(to, planChangedEmail(await getBrand(), { ...o, period: periodLabel(o.period), date: istDate(o.date) }));
}

/** Alert to the Maa One team; never blocks the request that triggered it. */
export async function sendAdminAlert(o: Parameters<typeof adminAlertEmail>[1], replyTo?: string) {
  await sendEmail(await adminAlertAddress(), adminAlertEmail(await getBrand(), o), { replyTo });
}

export { unixToIstDate };
