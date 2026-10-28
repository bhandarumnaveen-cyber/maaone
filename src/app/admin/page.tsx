import Link from "next/link";
import { BadgeIndianRupee, Download, IndianRupee, Lightbulb, LifeBuoy, MessageSquareText, TrendingUp, Users } from "lucide-react";
import { requireAdmin, type DashboardStats } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import { getPlans } from "@/lib/settings";
import { buttonClass } from "@/components/ui";
import {
  Avatar,
  BarChart,
  Donut,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  RankBars,
  StatCard,
  timeAgo,
} from "@/components/dashboard-ui";

export const metadata = { title: "Overview" };

const IST = "Asia/Kolkata";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: IST });
const monthKey = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: IST });

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: IST }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function AdminOverview() {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null; // the layout already redirected
  const { supabase, user } = auth;

  const since30 = new Date(Date.now() - 29 * 86_400_000);
  const since12m = new Date();
  since12m.setMonth(since12m.getMonth() - 11, 1);

  const [statsRes, profileRes, waitRes, recentRes, contactRes, ideasRes, paymentsRes, plans] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("waitlist").select("created_at, plan_interest, business_type").neq("status", "removed").limit(10000),
    supabase.from("waitlist").select("id, name, business_name, city, plan_interest, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("contact_messages").select("id, name, message, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("feature_requests").select("id, name, request, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("payments").select("amount, paid_at").eq("status", "captured").eq("currency", "INR").gte("paid_at", since12m.toISOString()),
    getPlans(),
  ]);

  const stats = statsRes.data as DashboardStats | null;
  const waitlist = waitRes.data ?? [];
  const firstName = (profileRes.data?.full_name || user.email?.split("@")[0] || "there").split(" ")[0];

  // Signups per day, last 30 days (IST)
  const perDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) perDay.set(dayKey(new Date(since30.getTime() + i * 86_400_000)), 0);
  for (const w of waitlist) {
    const k = dayKey(new Date(w.created_at));
    if (perDay.has(k)) perDay.set(k, perDay.get(k)! + 1);
  }
  const signups = [...perDay].map(([key, value]) => ({
    key,
    value,
    label: new Date(`${key}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: IST }),
  }));
  const signups30 = signups.reduce((a, d) => a + d.value, 0);

  // Revenue per month, last 12 months
  const perMonth = new Map<string, number>();
  for (let i = 0; i < 12; i++) perMonth.set(monthKey(new Date(since12m.getFullYear(), since12m.getMonth() + i, 15)), 0);
  for (const p of paymentsRes.data ?? []) {
    if (!p.paid_at) continue;
    const k = monthKey(new Date(p.paid_at));
    if (perMonth.has(k)) perMonth.set(k, perMonth.get(k)! + p.amount);
  }
  const revenue = [...perMonth].map(([key, value]) => ({
    key,
    value,
    label: new Date(`${key}-15T12:00:00+05:30`).toLocaleDateString("en-IN", { month: "short", timeZone: IST }),
  }));

  // Plan interest and business types
  const planName = (code: string | null) => plans.find((p) => p.code === code)?.name ?? "Not sure yet";
  const count = <T,>(items: T[], key: (t: T) => string) => {
    const m = new Map<string, number>();
    for (const i of items) m.set(key(i), (m.get(key(i)) ?? 0) + 1);
    return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  const planMix = count(waitlist, (w) => planName(w.plan_interest));
  const types = count(waitlist, (w) => w.business_type || "Other").slice(0, 6);

  return (
    <>
      <PageHeader
        title={
          <>
            {greeting()}, {firstName} <span aria-hidden="true">👋</span>
          </>
        }
        description="Here's how Maa One is doing."
        actions={
          <a href="/admin/export/waitlist" download className={buttonClass("secondary")}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export waitlist
          </a>
        }
      />

      {statsRes.error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Couldn&rsquo;t load dashboard numbers: {statsRes.error.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="On the waitlist"
          value={(stats?.waitlist_total ?? 0).toLocaleString("en-IN")}
          sub={<span className="font-medium text-success">+{stats?.waitlist_last_7_days ?? 0} this week</span>}
          icon={Users}
          tone="indigo"
          href="/admin/waitlist"
        />
        <StatCard
          label="Active subscribers"
          value={(stats?.subscriptions_active ?? 0).toLocaleString("en-IN")}
          sub={`${stats?.subscriptions_in_trial ?? 0} in free trial`}
          icon={BadgeIndianRupee}
          tone="green"
          href="/admin/subscribers"
        />
        <StatCard
          label="MRR (before GST)"
          value={formatMoney(stats?.mrr_inr_paise ?? 0, "INR")}
          sub="Yearly plans counted as 1/12"
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          label="Revenue this month"
          value={formatMoney(stats?.revenue_this_month_inr_paise ?? 0, "INR")}
          sub="Captured, incl. GST"
          icon={IndianRupee}
          tone="sky"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/contact" icon={MessageSquareText} label="New contact messages" value={stats?.contact_messages_new ?? 0} />
        <QuickLink href="/admin/feature-requests" icon={Lightbulb} label="New feature requests" value={stats?.feature_requests_new ?? 0} />
        <QuickLink href="/admin/support" icon={LifeBuoy} label="Open support tickets" value={stats?.support_tickets_open ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Waitlist signups"
          description={`${signups30} in the last 30 days`}
          action={{ href: "/admin/waitlist", label: "View waitlist" }}
        >
          <BarChart data={signups} label="Waitlist signups per day, last 30 days" />
        </Panel>
        <Panel title="Plan interest" description="What waitlist businesses want">
          <Donut data={planMix} centerLabel="businesses" label="Plan interest" />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Revenue" description="Captured payments per month, incl. GST">
          <BarChart data={revenue} label="Revenue per month, last 12 months" format={(n) => formatMoney(n, "INR")} />
        </Panel>
        <Panel title="Business types" description="Top segments on the waitlist">
          <RankBars data={types} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Latest signups" action={{ href: "/admin/waitlist", label: "All" }} bodyClassName="p-0">
          {recentRes.data?.length ? (
            <ul className="divide-y divide-line">
              {recentRes.data.map((w) => (
                <li key={w.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={w.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{w.name}</p>
                    <p className="truncate text-xs text-muted">
                      {[w.business_name, w.city].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Pill tone="indigo">{planName(w.plan_interest)}</Pill>
                    <p className="mt-1 text-[11px] text-muted">{timeAgo(w.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Users} title="No signups yet">Share the waitlist link to get your first businesses.</EmptyState>
          )}
        </Panel>
        <Panel title="Contact messages" action={{ href: "/admin/contact", label: "All" }} bodyClassName="p-0">
          <MiniFeed items={(contactRes.data ?? []).map((c) => ({ id: c.id, name: c.name, text: c.message, status: c.status, at: c.created_at }))} empty="No messages yet" />
        </Panel>
        <Panel title="Feature requests" action={{ href: "/admin/feature-requests", label: "All" }} bodyClassName="p-0">
          <MiniFeed items={(ideasRes.data ?? []).map((f) => ({ id: f.id, name: f.name || "Anonymous", text: f.request, status: f.status, at: f.created_at }))} empty="No requests yet" />
        </Panel>
      </div>
    </>
  );
}

function QuickLink({ href, icon: Icon, label, value }: { href: string; icon: typeof Users; label: string; value: number }) {
  return (
    <Link href={href} className="card flex items-center gap-3 px-4 py-3.5 shadow-sm transition-colors hover:border-brand-ink/40">
      <Icon className="h-5 w-5 text-brand-ink" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      <span className={value ? "rounded-full bg-rose-500 px-2 text-xs leading-5 font-bold text-white" : "text-sm font-semibold text-muted"}>
        {value}
      </span>
    </Link>
  );
}

function MiniFeed({ items, empty }: { items: { id: string; name: string; text: string; status: string; at: string }[]; empty: string }) {
  if (!items.length) return <p className="px-5 py-10 text-center text-sm text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((i) => (
        <li key={i.id} className="px-5 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-ink">{i.name}</p>
            <span className="shrink-0 text-[11px] text-muted">{timeAgo(i.at)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{i.text}</p>
          {i.status === "new" && <Pill tone="rose" className="mt-1.5">New</Pill>}
        </li>
      ))}
    </ul>
  );
}
