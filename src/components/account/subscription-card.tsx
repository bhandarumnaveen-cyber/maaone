import Link from "next/link";
import { CalendarClock, ExternalLink, Rocket, Sparkles } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { subStatus, type AccountSub } from "@/lib/account";
import type { Plan, Settings } from "@/lib/types";
import { Pill, istDate } from "../dashboard-ui";
import { ButtonLink } from "../ui";
import { PlanActions } from "./plan-actions";

/** The customer's plan: status, price, renewal date and (optionally) upgrade/downgrade/cancel. */
export function SubscriptionCard({
  sub,
  live,
  plans,
  settings,
  manage,
}: {
  sub: AccountSub | null;
  live: boolean;
  plans: Plan[];
  settings: Settings;
  manage?: boolean;
}) {
  if (!sub) {
    return (
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1e1b4b,#3730a3)] p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
        <Sparkles className="h-8 w-8 text-amber-300" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold">
          {settings.salesOpen ? `Start your ${settings.trialDays}-day free trial` : `Subscriptions open in ${settings.launchYear}`}
        </h2>
        <p className="mt-2 max-w-lg text-indigo-100">
          {settings.salesOpen
            ? "Try every Growth feature free. Cancel any time before the trial ends and pay nothing."
            : "You're all set. We'll email you the moment plans open, with your free trial ready to start."}
        </p>
        <ButtonLink href={settings.salesOpen ? "/signup" : "/pricing"} variant="accent" size="lg" className="mt-6">
          {settings.salesOpen ? "Choose a plan" : "See plans and pricing"}
        </ButtonLink>
      </section>
    );
  }

  const plan = plans.find((p) => p.code === sub.plan_code);
  const st = subStatus[sub.status] ?? { label: sub.status, tone: "slate" as const };
  const trial = sub.status === "authenticated";
  const dateLabel = trial ? "Free trial ends" : sub.cancel_at_period_end || !live ? "Access until" : "Next renewal";
  const date = trial ? sub.trial_ends_at : sub.current_period_end;
  const withGst = Math.round(sub.amount * (1 + settings.gstRate / 100));

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b4b,#3730a3)] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-200">Your plan</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold">{plan?.name ?? sub.plan_code}</h2>
              <Pill tone={st.tone}>{st.label}</Pill>
            </div>
            <p className="mt-2 text-indigo-100">
              {formatMoney(sub.amount, "INR")} / {sub.billing_period === "yearly" ? "year" : "month"} + GST ·{" "}
              {formatMoney(withGst, "INR")} total
            </p>
          </div>
          {settings.appReady ? (
            <a
              href={settings.appUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-300"
            >
              Open Maa One <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2.5 text-sm font-bold text-amber-200">
              <Rocket className="h-4 w-4" aria-hidden="true" /> App opens in {settings.launchYear}
            </span>
          )}
        </div>
        <div className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm">
          <CalendarClock className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <span className="text-indigo-100">{dateLabel}:</span>
          <span className="font-semibold">{istDate(date)}</span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {sub.status === "pending" || sub.status === "halted" ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Your last payment didn&rsquo;t go through. Razorpay will retry automatically — please make sure your card or
            UPI mandate is active. Need help? <Link href="/account/support" className="font-semibold underline">Contact support</Link>.
          </p>
        ) : null}
        {sub.cancel_at_period_end && (
          <p className="mb-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink">
            Your subscription is cancelled and won&rsquo;t renew. You keep full access until {istDate(sub.current_period_end)}.
          </p>
        )}
        {manage ? (
          live ? (
            <>
              <h3 className="font-semibold text-ink">Manage subscription</h3>
              <p className="mt-1 text-sm text-muted">
                Upgrades apply straight away. Downgrades and cancellations take effect at the end of the period you&rsquo;ve
                paid for. See our{" "}
                <Link href="/cancellation-policy" className="font-medium text-brand-ink underline underline-offset-2">
                  cancellation policy
                </Link>
                .
              </p>
              <PlanActions
                plans={plans}
                currentPlan={sub.plan_code}
                currentPeriod={sub.billing_period}
                canChange={sub.status === "active" && !sub.cancel_at_period_end}
                canCancel={!sub.cancel_at_period_end}
              />
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">This subscription has ended.</p>
              {settings.salesOpen && <ButtonLink href="/signup">Choose a new plan</ButtonLink>}
            </div>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Change plan, switch to yearly billing or cancel any time.</p>
            <ButtonLink href="/account/subscription" variant="secondary">
              Manage subscription
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
