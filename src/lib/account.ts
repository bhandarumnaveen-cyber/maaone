import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { LIVE_STATUSES } from "@/lib/auth";

export type AccountSub = {
  id: string;
  plan_code: string;
  billing_period: "monthly" | "yearly";
  amount: number;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
};

/** The logged-in customer's profile and current subscription (RLS limits rows to their own). */
export const loadAccount = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, is_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id, plan_code, billing_period, amount, status, trial_ends_at, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const all = (subs ?? []) as AccountSub[];
  // The live subscription, else the most recent one that got past checkout.
  const sub = all.find((s) => LIVE_STATUSES.includes(s.status) && s.status !== "created") ?? all.find((s) => s.status !== "created") ?? null;
  return { supabase, user, profile, sub, live: Boolean(sub && LIVE_STATUSES.includes(sub.status)) };
});

export const subStatus: Record<string, { label: string; tone: "green" | "amber" | "sky" | "slate" | "rose" }> = {
  authenticated: { label: "Free trial", tone: "sky" },
  active: { label: "Active", tone: "green" },
  pending: { label: "Payment failed — retrying", tone: "amber" },
  halted: { label: "Paused — payment failed", tone: "rose" },
  paused: { label: "Paused", tone: "amber" },
  cancelled: { label: "Cancelled", tone: "slate" },
  completed: { label: "Completed", tone: "slate" },
  expired: { label: "Expired", tone: "slate" },
};
