import { redirect } from "next/navigation";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";
import { loadAccount } from "@/lib/account";
import { getSettings } from "@/lib/settings";
import { SupportForm } from "@/components/account/support-form";
import { EmptyState, PageHeader, Panel, Pill, istDateTime } from "@/components/dashboard-ui";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  const [acct, settings] = await Promise.all([loadAccount(), getSettings()]);
  if (!acct) redirect("/login?next=/account/support");
  const { data: tickets } = await acct.supabase
    .from("support_tickets")
    .select("id, subject, message, status, admin_reply, created_at, updated_at")
    .eq("user_id", acct.user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Support" description="Ask us anything. Our reply appears here and we usually answer within one working day." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <Panel title="New request">
            <SupportForm />
          </Panel>
          <Panel title="Other ways to reach us">
            <ul className="space-y-3 text-sm">
              <li>
                <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-ink">
                  <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" /> WhatsApp {settings.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.supportEmail}`} className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-ink">
                  <Mail className="h-4 w-4 text-brand-ink" aria-hidden="true" /> {settings.supportEmail}
                </a>
              </li>
            </ul>
          </Panel>
        </div>
        <Panel title="Your requests" bodyClassName="p-0">
          {!tickets?.length ? (
            <EmptyState icon={LifeBuoy} title="No requests yet">Anything you send appears here with our reply.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{t.subject}</p>
                    <Pill tone={t.status === "answered" ? "green" : t.status === "open" ? "amber" : "slate"}>
                      {t.status === "open" ? "Waiting for reply" : t.status === "answered" ? "Answered" : "Closed"}
                    </Pill>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{istDateTime(t.created_at)}</p>
                  <p className="mt-2 text-sm whitespace-pre-line text-muted">{t.message}</p>
                  {t.admin_reply && (
                    <div className="mt-3 rounded-xl bg-brand-soft px-4 py-3 text-sm whitespace-pre-line text-ink">
                      <p className="mb-1 text-xs font-bold text-brand-ink">Maa One team</p>
                      {t.admin_reply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
