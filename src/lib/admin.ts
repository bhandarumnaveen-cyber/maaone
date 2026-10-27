import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Returns a Supabase client for the logged-in admin, or why access is refused. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" as const };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { status: "forbidden" as const };
  return { status: "ok" as const, supabase, user };
}

/** Admin lists and their CSV exports. Columns are read under RLS as the admin. */
export const adminTables = {
  waitlist: {
    title: "Waitlist",
    table: "waitlist",
    columns: ["position", "name", "business_name", "business_type", "city", "phone", "email", "plan_interest", "source", "status", "created_at"],
    order: "position",
    ascending: true,
  },
  "feature-requests": {
    title: "Feature requests",
    table: "feature_requests",
    columns: ["created_at", "name", "email", "request", "status"],
    order: "created_at",
    ascending: false,
  },
  contact: {
    title: "Contact messages",
    table: "contact_messages",
    columns: ["created_at", "name", "email", "phone", "message", "status"],
    order: "created_at",
    ascending: false,
  },
  subscribers: {
    title: "Subscribers",
    table: "subscriptions",
    columns: ["created_at", "user_id", "plan_code", "billing_period", "currency", "amount", "status", "trial_ends_at", "current_period_end", "cancel_at_period_end", "razorpay_subscription_id"],
    order: "created_at",
    ascending: false,
  },
  support: {
    title: "Support tickets",
    table: "support_tickets",
    columns: ["created_at", "id", "user_id", "subject", "message", "status", "admin_reply"],
    order: "created_at",
    ascending: false,
  },
} as const;

export type AdminTableKey = keyof typeof adminTables;

export function isAdminTable(k: string): k is AdminTableKey {
  return k in adminTables;
}

export type DashboardStats = {
  waitlist_total: number;
  waitlist_last_7_days: number;
  contact_messages_new: number;
  feature_requests_new: number;
  support_tickets_open: number;
  subscriptions_active: number;
  subscriptions_in_trial: number;
  mrr_inr_paise: number;
  revenue_this_month_inr_paise: number;
};

function csvCell(v: unknown) {
  if (v === null || v === undefined) return "";
  let s = typeof v === "object" ? JSON.stringify(v) : String(v);
  // Stop spreadsheet apps from treating user input as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns: readonly string[], rows: Record<string, unknown>[]) {
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))];
  return "﻿" + lines.join("\r\n");
}
