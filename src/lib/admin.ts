import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Returns a Supabase client for the logged-in admin, or why access is refused. Cached per request. */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" as const };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { status: "forbidden" as const };
  return { status: "ok" as const, supabase, user };
});

/**
 * Admin lists and their CSV exports. Rows are read under RLS as the admin.
 * `search` columns are matched with ilike; `statuses` are the values the admin may set.
 */
export const adminTables = {
  waitlist: {
    title: "Waitlist",
    table: "waitlist",
    columns: ["id", "position", "name", "business_name", "business_type", "city", "phone", "email", "plan_interest", "source", "status", "invited_at", "created_at"],
    search: ["name", "business_name", "business_type", "city", "email", "phone"],
    statuses: ["waiting", "invited", "converted", "removed"],
    order: "position",
    ascending: true,
  },
  "feature-requests": {
    title: "Feature requests",
    table: "feature_requests",
    columns: ["id", "created_at", "name", "email", "request", "status"],
    search: ["name", "email", "request"],
    statuses: ["new", "planned", "in_progress", "done", "declined"],
    order: "created_at",
    ascending: false,
  },
  contact: {
    title: "Contact messages",
    table: "contact_messages",
    columns: ["id", "created_at", "name", "email", "phone", "message", "status"],
    search: ["name", "email", "phone", "message"],
    statuses: ["new", "replied", "closed", "spam"],
    order: "created_at",
    ascending: false,
  },
  subscribers: {
    title: "Subscribers",
    table: "subscriptions",
    columns: ["id", "created_at", "user_id", "plan_code", "billing_period", "currency", "amount", "status", "trial_ends_at", "current_period_end", "cancel_at_period_end", "razorpay_subscription_id"],
    search: ["plan_code", "status", "razorpay_subscription_id"],
    statuses: [],
    order: "created_at",
    ascending: false,
  },
  support: {
    title: "Support tickets",
    table: "support_tickets",
    columns: ["id", "created_at", "user_id", "subject", "message", "status", "admin_reply"],
    search: ["subject", "message"],
    statuses: ["open", "answered", "closed"],
    order: "created_at",
    ascending: false,
  },
} as const;

export const PAGE_SIZE = 50;

/** Strips characters that have meaning in PostgREST filters. */
export function cleanSearch(q: string | undefined) {
  return (q ?? "").replace(/[,()%*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

/** One page of an admin list, optionally filtered by search text and status. */
export async function loadAdminList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: AdminTableKey,
  opts: { q?: string; status?: string; page?: string },
) {
  const def = adminTables[key];
  const page = Math.max(1, Number(opts.page) || 1);
  const q = cleanSearch(opts.q);
  let query = supabase
    .from(def.table)
    .select(def.columns.join(","), { count: "exact" })
    .order(def.order, { ascending: def.ascending })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(def.search.map((c) => `${c}.ilike.*${q}*`).join(","));
  if (opts.status && (def.statuses as readonly string[]).includes(opts.status)) query = query.eq("status", opts.status);
  const { data, count, error } = await query;
  return {
    rows: (data ?? []) as unknown as Record<string, unknown>[],
    count: count ?? 0,
    page,
    pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    q,
    error,
  };
}

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
