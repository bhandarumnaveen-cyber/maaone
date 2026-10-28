import { Mail, MessageCircle, Phone, Users } from "lucide-react";
import { adminTables, loadAdminList, requireAdmin } from "@/lib/admin";
import { getPlans } from "@/lib/settings";
import { whatsappHref } from "@/lib/contact-links";
import { Avatar, EmptyState, PageHeader, Pill, istDateTime } from "@/components/dashboard-ui";
import { ListToolbar, Pager } from "@/components/admin/list-toolbar";
import { StatusSelect } from "@/components/admin/status-select";

export const metadata = { title: "Waitlist" };

function sourceLabel(source: string | null) {
  if (!source || source === "website") return "Website";
  if (source.startsWith("ref:")) return `Referred by #${source.slice(4)}`;
  if (source.startsWith("utm:")) return `Campaign: ${source.slice(4)}`;
  return source;
}

type Row = {
  id: string;
  position: number;
  name: string;
  business_name: string | null;
  business_type: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  plan_interest: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

export default async function WaitlistAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;
  const params = await searchParams;
  const [list, plans, refRows] = await Promise.all([
    loadAdminList(auth.supabase, "waitlist", params),
    getPlans(),
    auth.supabase.from("waitlist").select("source").like("source", "ref:%").limit(10000),
  ]);
  // Referral counts per position, from signups whose source is "ref:<position>".
  const referrals = new Map<number, number>();
  for (const r of refRows.data ?? []) {
    const n = Number(String(r.source).slice(4));
    if (n) referrals.set(n, (referrals.get(n) ?? 0) + 1);
  }
  const rows = list.rows as unknown as Row[];
  const def = adminTables.waitlist;
  const back = `/admin/waitlist${params.q || params.status ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][])}` : ""}`;
  const planName = (c: string | null) => plans.find((p) => p.code === c)?.name ?? "Not sure";

  const contact = (r: Row) => {
    const wa = whatsappHref(r.phone, `Namaste ${r.name.split(" ")[0]} ji, this is Naveen from Maa One.`);
    const btn = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:border-brand-ink/40 hover:text-brand-ink";
    return (
      <div className="flex gap-1.5">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} hover:!border-emerald-400 hover:!text-emerald-600`} aria-label={`WhatsApp ${r.name}`} title="WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
        {r.phone && (
          <a href={`tel:${r.phone}`} className={btn} aria-label={`Call ${r.name}`} title={r.phone}>
            <Phone className="h-4 w-4" />
          </a>
        )}
        <a href={`mailto:${r.email}`} className={btn} aria-label={`Email ${r.name}`} title={r.email}>
          <Mail className="h-4 w-4" />
        </a>
      </div>
    );
  };

  return (
    <>
      <PageHeader title="Waitlist" description="Businesses waiting for Maa One. Invite them to the pilot or mark them converted." />
      <ListToolbar
        base="/admin/waitlist"
        q={list.q}
        status={params.status}
        statuses={def.statuses}
        count={list.count}
        exportKey="waitlist"
        placeholder="Search name, business, city, phone or email"
      />
      {list.error && <p role="alert" className="mb-4 text-sm text-red-600">{list.error.message}</p>}

      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title={list.q || params.status ? "No matches" : "No one on the waitlist yet"}>
            {list.q || params.status ? "Try a different search or filter." : "Signups from the website appear here."}
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60 text-xs font-semibold tracking-wide text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">#</th>
                  <th scope="col" className="px-4 py-3">Business</th>
                  <th scope="col" className="px-4 py-3">Type · City</th>
                  <th scope="col" className="px-4 py-3">Contact</th>
                  <th scope="col" className="px-4 py-3">Plan · Source</th>
                  <th scope="col" className="px-4 py-3 text-center">Referrals</th>
                  <th scope="col" className="px-4 py-3">Joined</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="align-middle hover:bg-surface-2/40">
                    <td className="px-4 py-3 font-semibold text-muted">{r.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{r.name}</p>
                          <p className="truncate text-xs text-muted">{r.business_name ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{r.business_type ?? "—"}</p>
                      <p className="text-xs text-muted">{r.city ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {contact(r)}
                      <p className="mt-1 max-w-[14rem] truncate text-xs text-muted">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={r.plan_interest ? "indigo" : "slate"}>{planName(r.plan_interest)}</Pill>
                      <p className="mt-1 text-xs text-muted">{sourceLabel(r.source)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {referrals.get(r.position) ? (
                        <Pill tone="green">{referrals.get(r.position)}</Pill>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{istDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <StatusSelect list="waitlist" id={r.id} status={r.status} options={def.statuses} back={back} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {rows.map((r) => (
              <li key={r.id} className="card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Avatar name={r.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{r.name}</p>
                        <p className="truncate text-sm text-muted">{r.business_name ?? "—"}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted">#{r.position}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {[r.business_type, r.city].filter(Boolean).join(" · ")} · {istDateTime(r.created_at)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {sourceLabel(r.source)}
                      {referrals.get(r.position) ? ` · ${referrals.get(r.position)} referred` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {contact(r)}
                      <div className="flex items-center gap-2">
                        <Pill tone={r.plan_interest ? "indigo" : "slate"}>{planName(r.plan_interest)}</Pill>
                        <StatusSelect list="waitlist" id={r.id} status={r.status} options={def.statuses} back={back} />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <Pager base="/admin/waitlist" page={list.page} pages={list.pages} params={{ q: list.q, status: params.status }} />
    </>
  );
}
