import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.razorpay.com/v1";

export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID ?? "";
export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export class RazorpayError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function call<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
  if (!razorpayConfigured()) throw new RazorpayError("Razorpay keys are not configured", 503);
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new RazorpayError(json?.error?.description ?? `Razorpay request failed (${res.status})`, res.status);
  }
  return json as T;
}

export type RzpSubscription = {
  id: string;
  plan_id: string;
  customer_id: string | null;
  status: string;
  current_start: number | null;
  current_end: number | null;
  start_at: number | null;
  ended_at: number | null;
  charge_at: number | null;
  notes: Record<string, string> | [];
  short_url?: string;
};

export type RzpPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  invoice_id: string | null;
  method: string | null;
  email: string | null;
  contact: string | null;
  error_reason: string | null;
  error_description: string | null;
  created_at: number;
  notes: Record<string, string> | [];
};

export const razorpay = {
  createSubscription: (body: {
    plan_id: string;
    total_count: number;
    start_at?: number;
    customer_notify?: 0 | 1;
    notes?: Record<string, string>;
  }) => call<RzpSubscription>("POST", "/subscriptions", body),
  fetchSubscription: (id: string) => call<RzpSubscription>("GET", `/subscriptions/${id}`),
  cancelSubscription: (id: string, atCycleEnd: boolean) =>
    call<RzpSubscription>("POST", `/subscriptions/${id}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 }),
  updateSubscription: (id: string, body: { plan_id: string; schedule_change_at: "now" | "cycle_end"; customer_notify?: 0 | 1 }) =>
    call<RzpSubscription>("PATCH", `/subscriptions/${id}`, body),
  fetchInvoice: (id: string) => call<{ id: string; subscription_id: string | null }>("GET", `/invoices/${id}`),
};

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Checkout handler signature: HMAC(payment_id|subscription_id, key_secret). */
export function verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${paymentId}|${subscriptionId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export const unixToIso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

/** Unix seconds → YYYY-MM-DD in India time. */
export const unixToIstDate = (s: number | null | undefined) =>
  s ? new Date(s * 1000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : null;
