"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { ButtonLink } from "./ui";
import {
  SALES_OPEN,
  TRIAL_DAYS,
  YEARLY_MONTHS_CHARGED,
  plans,
  primaryCta,
  type Plan,
} from "@/site.config";
import { formatMoney, type Billing, type Currency } from "@/lib/format";

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

export function Pricing() {
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
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} currency={currency} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, billing, currency }: { plan: Plan; billing: Billing; currency: Currency }) {
  const monthly = currency === "INR" ? plan.inr : plan.usd;
  const isTrial = plan.id === "trial";
  const amount = billing === "yearly" ? monthly * YEARLY_MONTHS_CHARGED : monthly;
  const cta = isTrial ? primaryCta("growth") : primaryCta(plan.id);
  const label = SALES_OPEN && !isTrial ? `Start with ${plan.name}` : cta.label;

  return (
    <article
      className={clsx(
        "card relative flex flex-col p-5",
        plan.popular && "border-brand-ink/60 shadow-xl shadow-brand/10 ring-1 ring-brand-ink/40",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-slate-950">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm text-muted">{plan.summary}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-ink">{formatMoney(amount, currency)}</span>
        <span className="text-sm text-muted">
          {isTrial ? `for ${TRIAL_DAYS} days` : billing === "yearly" ? "/year" : "/month"}
        </span>
      </p>
      <p className="mt-1 h-5 text-xs text-muted">
        {isTrial
          ? "Then pick any plan"
          : billing === "yearly"
            ? `${formatMoney(monthly, currency)}/month, billed yearly`
            : currency === "INR"
              ? "+ 18% GST"
              : "+ applicable taxes"}
      </p>
      <ButtonLink
        href={cta.href}
        variant={plan.popular ? "primary" : "secondary"}
        className="mt-5 w-full"
      >
        {label}
      </ButtonLink>
      <ul className="mt-5 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}
