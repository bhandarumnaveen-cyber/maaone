import { BadgeIndianRupee } from "lucide-react";
import { loadAdminList, requireAdmin } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import { getPlans } from "@/lib/settings";
import { Avatar, EmptyState, PageHeader, Pill, istDate, type Tone } from "@/components/dashboard-ui";
import { ListToolbar, Pager } from "@/components/admin/list-toolbar";

export const metadata = { title: "Subscribers" };

type Row = {
  id: string;
  created_at: string;
  user_id: string | null;
  plan_code: string;
  billing_period: "monthly" | "yearly";
  currency: "INR" | "USD";
  amount: number;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const statusTone: Record<string, [string, Tone]> = {
  created: ["Checkout started", "slate"],
  authenticated: ["Free trial", "sky"],
  active: ["Active", "green"],
  pending: ["Payment failed", "amber"],
  halted: ["Halted", "rose"],
  paused: ["Paused", "amber"],
  cancelled: ["Cancelled", "slate"],
  completed: ["Completed", "slate"],
  expired: ["Expired", "slate"],
};

export default async function SubscribersAdmin({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;
  const params = await searchParams;
  const [list, plans] = await Promise.all([loadAdminList(auth.supabase, "subscribers", params), getPlans()]);
  const rows = list.rows as unknown as Row[];
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  const [{ data: people }, { data: billing }] = ids.length
    ? await Promise.all([
        auth.supabase.from("profiles").select("id, full_name, email, phone").in("id", ids),
        auth.supabase.from("billing_details").select("user_id, business_name, city, gstin").in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }];
  const who = Object.fromEntries((people ?? []).map((p) => [p.id, p]));
  const biz = Object.fromEntries((billing ?? []).map((b) => [b.user_id, b]));

  return (
    <>
      <PageHeader title="Subscribers" description="Every subscription, newest first. Payments and invoices are handled by the Razorpay webhook." />
      <ListToolbar base="/admin/subscribers" q={list.q} statuses={[]} count={list.count} exportKey="subscribers" placeholder="Search plan, status or Razorpay ID" />
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={BadgeIndianRupee} title="No subscribers yet">
            Subscriptions appear here once sales open and customers start their trial.
          </EmptyState>
        </div>
      ) : (
        <div className="card overflow-x-auto shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-2/60 text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Customer</th>
                <th scope="col" className="px-4 py-3">Plan</th>
                <th scope="col" className="px-4 py-3">Price</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Renews / ends</th>
                <th scope="col" className="px-4 py-3">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const p = r.user_id ? who[r.user_id] : undefined;
                const b = r.user_id ? biz[r.user_id] : undefined;
                const name = b?.business_name || p?.full_name || p?.email || "Customer";
                const [label, tone] = statusTone[r.status] ?? [r.status, "slate" as Tone];
                return (
                  <tr key={r.id} className="hover:bg-surface-2/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{name}</p>
                          <p className="truncate text-xs text-muted">{[p?.email ?? p?.phone, b?.city].filter(Boolean).join(" · ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{plans.find((x) => x.code === r.plan_code)?.name ?? r.plan_code}</p>
                      <p className="text-xs text-muted capitalize">{r.billing_period}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink">
                      {formatMoney(r.amount, r.currency)}
                      <span className="text-xs text-muted"> + GST</span>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={tone}>{label}</Pill>
                      {r.cancel_at_period_end && <p className="mt-1 text-xs text-muted">Won&rsquo;t renew</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {r.status === "authenticated" ? `Trial ends ${istDate(r.trial_ends_at)}` : istDate(r.current_period_end)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{istDate(r.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager base="/admin/subscribers" page={list.page} pages={list.pages} params={{ q: list.q }} />
    </>
  );
}
