import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, LifeBuoy, UserRound } from "lucide-react";
import { loadAccount } from "@/lib/account";
import { getPlans, getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";
import { AppImage } from "@/components/app-image";
import { SubscriptionCard } from "@/components/account/subscription-card";
import { PageHeader, Panel, StatCard, istDate } from "@/components/dashboard-ui";

export const metadata = { title: "Overview" };

export default async function AccountOverview({ searchParams }: { searchParams: Promise<{ welcome?: string; pending?: string }> }) {
  const [acct, settings, plans, params] = await Promise.all([loadAccount(), getSettings(), getPlans(), searchParams]);
  if (!acct) redirect("/login?next=/account");
  const { supabase, user, profile, sub, live } = acct;

  const [{ data: invoices, count: invoiceCount }, { data: billing }, { count: openTickets }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, total, currency, pdf_path", { count: "exact" })
      .eq("user_id", user.id)
      .order("invoice_date", { ascending: false })
      .limit(3),
    supabase.from("billing_details").select("business_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("status", "closed"),
  ]);

  const first = (profile?.full_name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title={
          <>
            Namaste{first ? `, ${first}` : ""} <span aria-hidden="true">🙏</span>
          </>
        }
        description={billing?.business_name ? `Here's everything for ${billing.business_name}.` : "Your Maa One plan, invoices and support."}
      />

      {params.welcome && (
        <p role="status" className="mb-6 rounded-xl bg-success-soft px-4 py-3 text-success">
          Welcome to Maa One! Your subscription is set up.
        </p>
      )}
      {params.pending && !params.welcome && (
        <p role="status" className="mb-6 rounded-xl bg-accent-soft px-4 py-3 text-accent-ink">
          We&rsquo;re confirming your payment with Razorpay. This page updates within a minute.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SubscriptionCard sub={sub} live={live} plans={plans} settings={settings} />
        <section className="relative flex flex-col overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#f6f4ff,#fff6ea)] p-6 dark:bg-[linear-gradient(160deg,#151335,#1d1408)]">
          <h2 className="text-lg font-bold text-ink">Run your business from your phone</h2>
          <p className="mt-1 text-sm text-muted">Install Maa One on your phone from the browser — no app store needed.</p>
          {settings.appReady ? (
            <a href={settings.appUrl} className="mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-ink hover:underline">
              Open Maa One <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-ink">
              App opens on {settings.launchDateLabel}
            </p>
          )}
          <AppImage name="phone-home" sizes="180px" className="mx-auto -mb-24 mt-4 w-44 drop-shadow-xl" />
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Invoices" value={String(invoiceCount ?? 0)} sub="GST invoices to download" icon={FileText} tone="indigo" href="/account/invoices" />
        <StatCard label="Open support requests" value={String(openTickets ?? 0)} sub="We usually reply within a day" icon={LifeBuoy} tone="amber" href="/account/support" />
        <StatCard label="Profile" value={first || "Add name"} sub={user.email ?? user.phone ?? ""} icon={UserRound} tone="green" href="/account/profile" />
      </div>

      <Panel className="mt-6" title="Recent invoices" action={{ href: "/account/invoices", label: "All invoices" }} bodyClassName="p-0">
        {invoices?.length ? (
          <ul className="divide-y divide-line">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-ink">{inv.invoice_number}</p>
                  <p className="text-xs text-muted">{istDate(inv.invoice_date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-ink">{formatMoney(inv.total, inv.currency)}</span>
                  {inv.pdf_path && (
                    <a href={`/account/invoices/${inv.id}`} className="text-sm font-semibold text-brand-ink hover:underline">
                      PDF
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">Your GST invoices appear here after each payment.</p>
        )}
      </Panel>

      <p className="mt-6 text-center text-sm text-muted">
        Questions? <Link href="/account/support" className="font-semibold text-brand-ink hover:underline">Ask support</Link> or WhatsApp{" "}
        <a href={settings.whatsappLink} className="font-semibold text-brand-ink hover:underline" target="_blank" rel="noopener noreferrer">
          {settings.whatsappDisplay}
        </a>
        .
      </p>
    </>
  );
}
