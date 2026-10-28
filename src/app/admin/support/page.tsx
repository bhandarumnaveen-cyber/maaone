import { LifeBuoy } from "lucide-react";
import { adminTables, loadAdminList, requireAdmin } from "@/lib/admin";
import { Avatar, EmptyState, PageHeader, istDateTime } from "@/components/dashboard-ui";
import { ListToolbar, Pager } from "@/components/admin/list-toolbar";
import { StatusSelect } from "@/components/admin/status-select";
import { buttonClass } from "@/components/ui";
import { PendingSubmit } from "@/components/pending-submit";

export const metadata = { title: "Support tickets" };

type Row = { id: string; created_at: string; user_id: string; subject: string; message: string; status: string; admin_reply: string | null };

export default async function SupportAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;
  const params = await searchParams;
  const list = await loadAdminList(auth.supabase, "support", params);
  const rows = list.rows as unknown as Row[];
  const statuses = adminTables.support.statuses;
  const back = `/admin/support${params.status ? `?status=${params.status}` : ""}`;

  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: people } = ids.length
    ? await auth.supabase.from("profiles").select("id, full_name, email, phone").in("id", ids)
    : { data: [] };
  const who = Object.fromEntries((people ?? []).map((p) => [p.id, p]));

  return (
    <>
      <PageHeader title="Support tickets" description="Questions from customers' account pages. Your reply shows in their account." />
      <ListToolbar base="/admin/support" q={list.q} status={params.status} statuses={statuses} count={list.count} exportKey="support" placeholder="Search subjects and messages" />
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={LifeBuoy} title={list.q || params.status ? "No matches" : "No support tickets"}>
            Tickets from customers appear here.
          </EmptyState>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const p = who[r.user_id];
            const name = p?.full_name || p?.email || p?.phone || "Customer";
            return (
              <li key={r.id} className="card p-5 shadow-sm">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{r.subject}</p>
                    <p className="text-xs text-muted">
                      {name}
                      {p?.email && p.email !== name ? ` · ${p.email}` : ""} · {istDateTime(r.created_at)}
                    </p>
                  </div>
                  <StatusSelect list="support" id={r.id} status={r.status} options={statuses} back={back} />
                </div>
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink">{r.message}</p>
                <form action="/api/admin/tickets" method="post" className="mt-4 space-y-2 border-t border-line pt-4">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="answered" />
                  <label htmlFor={`reply-${r.id}`} className="label">
                    {r.admin_reply ? "Your reply (edit to update)" : "Reply"}
                  </label>
                  <textarea id={`reply-${r.id}`} name="admin_reply" rows={3} defaultValue={r.admin_reply ?? ""} className="input text-sm" required />
                  <PendingSubmit busyText="Sending…" className={buttonClass("primary")}>
                    {r.admin_reply ? "Update reply" : "Send reply"}
                  </PendingSubmit>
                </form>
              </li>
            );
          })}
        </ul>
      )}
      <Pager base="/admin/support" page={list.page} pages={list.pages} params={{ q: list.q, status: params.status }} />
    </>
  );
}
