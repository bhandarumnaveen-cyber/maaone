import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import clsx from "clsx";
import { Download, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPlans, getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";
import { primaryCta } from "@/lib/cta";
import { ButtonLink, buttonClass } from "@/components/ui";
import { BillingForm, type Billing } from "@/components/forms/billing-form";
import { PlanActions } from "@/components/account/plan-actions";
import { SupportForm } from "@/components/account/support-form";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

type Sub = {
  id: string;
  plan_code: string;
  billing_period: "monthly" | "yearly";
  amount: number;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
};

const LIVE = ["created", "authenticated", "active", "pending", "halted", "paused"];

const statusText: Record<string, { label: string; tone: "ok" | "warn" | "muted" }> = {
  created: { label: "Checkout not finished", tone: "warn" },
  authenticated: { label: "Free trial", tone: "ok" },
  active: { label: "Active", tone: "ok" },
  pending: { label: "Payment failed — retrying", tone: "warn" },
  halted: { label: "Paused — payment failed", tone: "warn" },
  paused: { label: "Paused", tone: "warn" },
  cancelled: { label: "Cancelled", tone: "muted" },
  completed: { label: "Completed", tone: "muted" },
  expired: { label: "Expired", tone: "muted" },
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "—";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; pending?: string }>;
}) {
  const [supabase, cfg, plans, params] = await Promise.all([createClient(), getSettings(), getPlans(), searchParams]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: billing }, { data: subs }, { data: invoices }, { data: tickets }] = await Promise.all([
    supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("billing_details")
      .select("business_name, gstin, address_line1, address_line2, city, state, pincode")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id, plan_code, billing_period, amount, status, trial_ends_at, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, total, currency, status, pdf_path")
      .eq("user_id", user.id)
      .order("invoice_date", { ascending: false }),
    supabase
      .from("support_tickets")
      .select("id, subject, message, status, admin_reply, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const all = (subs ?? []) as Sub[];
  const sub = all.find((s) => LIVE.includes(s.status) && s.status !== "created") ?? all.find((s) => s.status !== "created");
  const plan = sub ? plans.find((p) => p.code === sub.plan_code) : undefined;
  const live = sub && LIVE.includes(sub.status);
  const st = sub ? (statusText[sub.status] ?? { label: sub.status, tone: "muted" as const }) : null;

  return (
    <section className="container-page max-w-4xl py-12 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">My account</h1>
          <p className="mt-1 text-muted">{profile?.full_name ? `${profile.full_name} · ` : ""}{user.email ?? user.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={cfg.appUrl} className={buttonClass("primary")}>
            Open Maa One <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          {profile?.is_admin && (
            <Link href="/admin" className={buttonClass("secondary")}>
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className={buttonClass("secondary")}>
              Log out
            </button>
          </form>
        </div>
      </div>

      {params.welcome && (
        <p role="status" className="mt-6 rounded-xl bg-success-soft px-4 py-3 text-success">
          Welcome to Maa One! Your subscription is set up. Tap &ldquo;Open Maa One&rdquo; to get started.
        </p>
      )}
      {params.pending && !params.welcome && (
        <p role="status" className="mt-6 rounded-xl bg-accent-soft px-4 py-3 text-accent-ink">
          We&rsquo;re confirming your payment with Razorpay. This page will update in a minute.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {/* My plan */}
        <Panel title="My plan">
          {sub && st ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-bold text-ink">{plan?.name ?? sub.plan_code}</p>
                <span
                  className={clsx(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    st.tone === "ok" && "bg-success-soft text-success",
                    st.tone === "warn" && "bg-accent-soft text-accent-ink",
                    st.tone === "muted" && "bg-surface-2 text-muted",
                  )}
                >
                  {st.label}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <Item label="Price">
                  {formatMoney(sub.amount, "INR")} / {sub.billing_period === "yearly" ? "year" : "month"} + GST
                </Item>
                {sub.status === "authenticated" ? (
                  <Item label="Trial ends">{fmtDate(sub.trial_ends_at)}</Item>
                ) : (
                  <Item label={sub.cancel_at_period_end || !live ? "Access until" : "Renews on"}>
                    {fmtDate(sub.current_period_end)}
                  </Item>
                )}
                {sub.cancel_at_period_end && <Item label="Renewal">Cancelled — won&rsquo;t renew</Item>}
              </dl>
              {live && (
                <PlanActions
                  plans={plans}
                  currentPlan={sub.plan_code}
                  currentPeriod={sub.billing_period}
                  canChange={sub.status === "active" && !sub.cancel_at_period_end}
                  canCancel={!sub.cancel_at_period_end}
                />
              )}
              {!live && cfg.salesOpen && (
                <ButtonLink href="/signup" className="mt-5">
                  Choose a plan
                </ButtonLink>
              )}
            </>
          ) : (
            <>
              <p className="text-muted">
                {cfg.salesOpen
                  ? "You don't have a plan yet."
                  : `Subscriptions open on ${cfg.launchDateLabel}. We'll email you when they do.`}
              </p>
              <ButtonLink href={cfg.salesOpen ? "/signup" : primaryCta(cfg).href} className="mt-4">
                {cfg.salesOpen ? `Start ${cfg.trialDays}-day free trial` : "Join the waitlist"}
              </ButtonLink>
            </>
          )}
        </Panel>

        {/* Invoices */}
        <Panel title="Invoices">
          {invoices?.length ? (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">Invoice</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Date</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Amount</th>
                    <th scope="col" className="py-2 font-medium"><span className="sr-only">Download</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 pr-3 font-medium text-ink">
                        {inv.invoice_number}
                        {inv.status === "cancelled" && <span className="ml-2 text-xs text-muted">(cancelled)</span>}
                      </td>
                      <td className="py-2.5 pr-3 text-muted">{fmtDate(inv.invoice_date)}</td>
                      <td className="py-2.5 pr-3 text-ink">{formatMoney(inv.total, inv.currency)}</td>
                      <td className="py-2.5 text-right">
                        {inv.pdf_path ? (
                          <a href={`/account/invoices/${inv.id}`} className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline">
                            <Download className="h-4 w-4" aria-hidden="true" /> PDF
                          </a>
                        ) : (
                          <span className="text-xs text-muted">Preparing…</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">Your GST invoices will appear here after each payment.</p>
          )}
        </Panel>

        {/* Billing details */}
        <Panel title="Billing details" description="Printed on your GST invoices. Changes apply to future invoices.">
          <BillingForm initial={billing as Billing | null} />
        </Panel>

        {/* Support */}
        <Panel title="Support" description={`Or email ${cfg.supportEmail} · WhatsApp ${cfg.whatsappDisplay}`}>
          <SupportForm />
          {tickets?.length ? (
            <ul className="mt-6 divide-y divide-line border-t border-line">
              {tickets.map((t) => (
                <li key={t.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">{t.subject}</p>
                    <span className="text-xs text-muted">
                      {t.status === "open" ? "Open" : t.status === "answered" ? "Answered" : "Closed"} · {fmtDate(t.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-line text-muted">{t.message}</p>
                  {t.admin_reply && (
                    <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-sm whitespace-pre-line text-ink">
                      <strong className="text-brand-ink">Maa One team:</strong> {t.admin_reply}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const id = `${title.toLowerCase().replace(/\W+/g, "-")}-title`;
  return (
    <section className="card p-5 sm:p-6" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{children}</dd>
    </div>
  );
}
