"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { ButtonLink } from "./ui";
import { useSettings } from "./settings-provider";
import { primaryCta } from "@/lib/cta";
import { formatMoney, type Billing, type Currency } from "@/lib/format";
import type { Plan, Settings } from "@/lib/types";

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
            value === o.value ? "bg-brand text-white" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pricing({ plans }: { plans: Plan[] }) {
  const settings = useSettings();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Toggle
          label="Billing period"
          value={billing}
          onChange={setBilling}
          options={[
            { value: "monthly", label: "Monthly" },
            {
              value: "yearly",
              label: (
                <span className="inline-flex items-center gap-1.5">
                  Yearly
                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      billing === "yearly" ? "bg-accent text-slate-950" : "bg-accent-soft text-accent-ink",
                    )}
                  >
                    2 months free
                  </span>
                </span>
              ),
            },
          ]}
        />
        <Toggle
          label="Currency"
          value={currency}
          onChange={setCurrency}
          options={[
            { value: "INR", label: "₹ INR" },
            { value: "USD", label: "$ USD" },
          ]}
        />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <TrialCard settings={settings} />
        {plans.map((plan) => (
          <PlanCard key={plan.code} plan={plan} billing={billing} currency={currency} settings={settings} />
        ))}
      </div>
    </div>
  );
}

function TrialCard({ settings }: { settings: Settings }) {
  const cta = primaryCta(settings, "growth");
  return (
    <CardShell
      name="Free trial"
      summary={`Everything in Growth, free for ${settings.trialDays} days.`}
      price="₹0"
      unit={`for ${settings.trialDays} days`}
      note="Then pick any plan"
      cta={cta}
      features={["Everything in Growth", "Every live module, 3 users", `Cancel before day ${settings.trialDays} and pay nothing`]}
    />
  );
}

function PlanCard({
  plan,
  billing,
  currency,
  settings,
}: {
  plan: Plan;
  billing: Billing;
  currency: Currency;
  settings: Settings;
}) {
  const inr = currency === "INR";
  const monthly = inr ? plan.inrMonthly : plan.usdMonthly;
  const yearly = inr ? plan.inrYearly : plan.usdYearly;
  const cta = primaryCta(settings, plan.code);
  return (
    <CardShell
      name={plan.name}
      summary={plan.tagline}
      popular={plan.popular}
      price={formatMoney(billing === "yearly" ? yearly : monthly, currency)}
      unit={billing === "yearly" ? "/year" : "/month"}
      note={
        billing === "yearly"
          ? `${formatMoney(Math.round(yearly / 12), currency)}/month, billed yearly`
          : inr
            ? `+ ${settings.gstRate}% GST`
            : "+ applicable taxes"
      }
      cta={{ href: cta.href, label: settings.salesOpen ? `Start with ${plan.name}` : cta.label }}
      features={plan.features}
    />
  );
}

function CardShell({
  name,
  summary,
  popular,
  price,
  unit,
  note,
  cta,
  features,
}: {
  name: string;
  summary: string;
  popular?: boolean;
  price: string;
  unit: string;
  note: string;
  cta: { href: string; label: string };
  features: string[];
}) {
  return (
    <article
      className={clsx(
        "card relative flex flex-col p-5",
        popular && "border-brand-ink/60 shadow-xl shadow-brand/10 ring-1 ring-brand-ink/40",
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-slate-950">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-ink">{name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm text-muted">{summary}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-ink">{price}</span>
        <span className="text-sm text-muted">{unit}</span>
      </p>
      <p className="mt-1 h-5 text-xs text-muted">{note}</p>
      <ButtonLink href={cta.href} variant={popular ? "primary" : "secondary"} className="mt-5 w-full">
        {cta.label}
      </ButtonLink>
      <ul className="mt-5 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}
