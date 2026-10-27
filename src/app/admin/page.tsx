import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import clsx from "clsx";
import { Download } from "lucide-react";
import { adminTables, isAdminTable, requireAdmin, type AdminTableKey, type DashboardStats } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ROW_LIMIT = 200;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status === "anonymous") redirect("/login?next=/admin");
  if (auth.status === "forbidden") notFound();
  const { supabase } = auth;

  const tabParam = (await searchParams).tab ?? "waitlist";
  const tab: AdminTableKey = isAdminTable(tabParam) ? tabParam : "waitlist";
  const def = adminTables[tab];

  const yearAgo = new Date();
  yearAgo.setMonth(yearAgo.getMonth() - 11, 1);
  yearAgo.setHours(0, 0, 0, 0);

  const [statsRes, rowsRes, paymentsRes] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase
      .from(def.table)
      .select(def.columns.join(","), { count: "exact" })
      .order(def.order, { ascending: def.ascending })
      .limit(ROW_LIMIT),
    supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("status", "captured")
      .eq("currency", "INR")
      .gte("paid_at", yearAgo.toISOString()),
  ]);

  const stats = statsRes.data as DashboardStats | null;
  const rows = (rowsRes.data ?? []) as unknown as Record<string, unknown>[];

  // Subscriptions point at auth users; look up their emails from profiles.
  let emails: Record<string, string> = {};
  if (tab === "subscribers" && rows.length) {
    const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
    const { data } = await supabase.from("profiles").select("id, email, phone").in("id", ids);
    emails = Object.fromEntries((data ?? []).map((p) => [p.id, p.email ?? p.phone ?? ""]));
  }

  const revenueByMonth = monthlyRevenue(paymentsRes.data ?? [], yearAgo);

  const cards = stats
    ? [
        { label: "On waitlist", value: stats.waitlist_total.toLocaleString("en-IN"), sub: `+${stats.waitlist_last_7_days} this week` },
        { label: "Active subscribers", value: stats.subscriptions_active.toLocaleString("en-IN"), sub: `${stats.subscriptions_in_trial} in trial` },
        { label: "MRR (before GST)", value: formatMoney(stats.mrr_inr_paise, "INR"), sub: "Yearly plans counted as 1/12" },
        { label: "Revenue this month", value: formatMoney(stats.revenue_this_month_inr_paise, "INR"), sub: "Captured, incl. GST" },
        { label: "New contact messages", value: String(stats.contact_messages_new) },
        { label: "New feature requests", value: String(stats.feature_requests_new) },
        { label: "Open support tickets", value: String(stats.support_tickets_open) },
      ]
    : [];

  return (
    <section className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Admin</h1>

      {statsRes.error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Couldn&rsquo;t load dashboard numbers: {statsRes.error.message}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <dt className="text-xs font-medium text-muted">{c.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-ink">{c.value}</dd>
            {c.sub && <dd className="mt-0.5 text-xs text-muted">{c.sub}</dd>}
          </div>
        ))}
      </dl>

      <div className="card mt-6 p-5">
        <h2 className="font-semibold text-ink">Monthly revenue (INR, captured, incl. GST)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-muted">
                {revenueByMonth.map((m) => (
                  <th key={m.key} scope="col" className="px-2 py-1 font-medium whitespace-nowrap">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-ink">
                {revenueByMonth.map((m) => (
                  <td key={m.key} className="px-2 py-1 font-semibold whitespace-nowrap">
                    {formatMoney(m.total, "INR")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <nav aria-label="Admin lists" className="mt-8 flex gap-2 overflow-x-auto border-b border-line">
        {(Object.keys(adminTables) as AdminTableKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin?tab=${k}`}
            aria-current={k === tab ? "page" : undefined}
            className={clsx(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap",
              k === tab ? "border-brand-ink text-brand-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {adminTables[k].title}
          </Link>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {rowsRes.count ?? rows.length} total
          {(rowsRes.count ?? 0) > ROW_LIMIT ? ` · showing the first ${ROW_LIMIT}` : ""}
        </p>
        <a href={`/admin/export/${tab}`} className={buttonClass("secondary")}>
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </a>
      </div>

      {rowsRes.error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {rowsRes.error.message}
        </p>
      ) : (
        <div className="relative mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                {tab === "subscribers" && <th className="px-3 py-2.5 font-semibold text-ink">customer</th>}
                {def.columns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap text-ink">
                    {c.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={def.columns.length + 1} className="px-3 py-8 text-center text-muted">
                    Nothing here yet.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={i} className="align-top">
                  {tab === "subscribers" && (
                    <td className="px-3 py-2 whitespace-nowrap text-ink">{emails[r.user_id as string] ?? "—"}</td>
                  )}
                  {def.columns.map((c) => (
                    <td key={c} className="max-w-xs px-3 py-2 text-muted">
                      {formatCell(c, r[c], r.currency as string)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatCell(column: string, v: unknown, currency?: string) {
  if (v === null || v === undefined || v === "") return "—";
  if (column === "amount") return formatMoney(Number(v), currency === "USD" ? "USD" : "INR");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (/_at$|_end$/.test(column)) {
    return new Date(String(v)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  }
  const s = String(v);
  return <span className="line-clamp-3 break-words">{s}</span>;
}

/** Sums captured INR payments into the last 12 calendar months (IST). */
function monthlyRevenue(payments: { amount: number; paid_at: string | null }[], from: Date) {
  const key = (d: Date) =>
    d.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" });
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 15);
    months.push({
      key: key(d),
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      total: 0,
    });
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  for (const p of payments) {
    if (!p.paid_at) continue;
    const m = byKey[key(new Date(p.paid_at))];
    if (m) m.total += p.amount;
  }
  return months;
}
