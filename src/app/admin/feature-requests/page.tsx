import { Lightbulb, Mail } from "lucide-react";
import { adminTables, loadAdminList, requireAdmin } from "@/lib/admin";
import { Avatar, EmptyState, PageHeader, timeAgo } from "@/components/dashboard-ui";
import { ListToolbar, Pager } from "@/components/admin/list-toolbar";
import { StatusSelect } from "@/components/admin/status-select";

export const metadata = { title: "Feature requests" };

type Row = { id: string; created_at: string; name: string | null; email: string | null; request: string; status: string };

export default async function FeatureRequestsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;
  const params = await searchParams;
  const list = await loadAdminList(auth.supabase, "feature-requests", params);
  const rows = list.rows as unknown as Row[];
  const statuses = adminTables["feature-requests"].statuses;
  const back = `/admin/feature-requests${params.status ? `?status=${params.status}` : ""}`;

  return (
    <>
      <PageHeader title="Feature requests" description="Ideas from the roadmap page. Plan them, ship them, or decline them." />
      <ListToolbar base="/admin/feature-requests" q={list.q} status={params.status} statuses={statuses} count={list.count} exportKey="feature-requests" placeholder="Search requests, names or emails" />
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={Lightbulb} title={list.q || params.status ? "No matches" : "No feature requests yet"}>
            Requests from the roadmap page appear here.
          </EmptyState>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-col p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar name={r.name || "Anonymous"} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{r.name || "Anonymous"}</p>
                  <p className="truncate text-xs text-muted">{r.email ?? "No email"} · {timeAgo(r.created_at)}</p>
                </div>
                <StatusSelect list="feature-requests" id={r.id} status={r.status} options={statuses} back={back} />
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed whitespace-pre-line text-ink">{r.request}</p>
              {r.email && (
                <a
                  href={`mailto:${r.email}?subject=${encodeURIComponent("Your Maa One feature request")}`}
                  className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-ink hover:underline"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> Reply by email
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pager base="/admin/feature-requests" page={list.page} pages={list.pages} params={{ q: list.q, status: params.status }} />
    </>
  );
}
