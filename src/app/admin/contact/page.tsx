import { Mail, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import { adminTables, loadAdminList, requireAdmin } from "@/lib/admin";
import { whatsappHref } from "@/lib/contact-links";
import { Avatar, EmptyState, PageHeader, Pill, istDateTime } from "@/components/dashboard-ui";
import { ListToolbar, Pager } from "@/components/admin/list-toolbar";
import { StatusSelect } from "@/components/admin/status-select";
import { buttonClass } from "@/components/ui";

export const metadata = { title: "Contact messages" };

type Row = { id: string; created_at: string; name: string; email: string; phone: string | null; message: string; status: string };

export default async function ContactAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;
  const params = await searchParams;
  const list = await loadAdminList(auth.supabase, "contact", params);
  const rows = list.rows as unknown as Row[];
  const statuses = adminTables.contact.statuses;
  const back = `/admin/contact${params.status ? `?status=${params.status}` : ""}`;

  return (
    <>
      <PageHeader title="Contact messages" description="Messages from the contact page. Reply, then mark them replied." />
      <ListToolbar base="/admin/contact" q={list.q} status={params.status} statuses={statuses} count={list.count} exportKey="contact" placeholder="Search messages, names, emails or phones" />
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={MessageSquareText} title={list.q || params.status ? "No matches" : "No messages yet"}>
            Messages from the contact form appear here.
          </EmptyState>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const topic = r.message.match(/^\[([^\]]+)\]\s*/);
            const body = topic ? r.message.slice(topic[0].length) : r.message;
            const wa = whatsappHref(r.phone, `Namaste ${r.name.split(" ")[0]} ji, thank you for contacting Maa One.`);
            return (
              <li key={r.id} className="card p-5 shadow-sm">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar name={r.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-muted">
                      {r.email}
                      {r.phone ? ` · ${r.phone}` : ""} · {istDateTime(r.created_at)}
                    </p>
                  </div>
                  {topic && <Pill tone="violet">{topic[1]}</Pill>}
                  <StatusSelect list="contact" id={r.id} status={r.status} options={statuses} back={back} />
                </div>
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink">{body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${r.email}?subject=${encodeURIComponent("Re: your message to Maa One")}`} className={buttonClass("secondary")}>
                    <Mail className="h-4 w-4" aria-hidden="true" /> Reply by email
                  </a>
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
                      <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" /> WhatsApp
                    </a>
                  )}
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className={buttonClass("ghost")}>
                      <Phone className="h-4 w-4" aria-hidden="true" /> Call
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pager base="/admin/contact" page={list.page} pages={list.pages} params={{ q: list.q, status: params.status }} />
    </>
  );
}
