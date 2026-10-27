"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Lock } from "lucide-react";
import { BillingForm, type Billing } from "./forms/billing-form";
import { FormError } from "./forms/field";
import { buttonClass } from "./ui";
import { formatMoney } from "@/lib/format";
import type { Plan, Settings } from "@/lib/types";

type CheckoutOptions = {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill: Record<string, string | undefined>;
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function Checkout({
  plans,
  initialPlan,
  initialPeriod,
  billing,
  settings,
  trialEligible,
}: {
  plans: Plan[];
  initialPlan: string;
  initialPeriod: "monthly" | "yearly";
  billing: Billing | null;
  settings: Settings;
  trialEligible: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"billing" | "pay">(billing ? "pay" : "billing");
  const [planCode, setPlanCode] = useState(initialPlan);
  const [period, setPeriod] = useState(initialPeriod);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = plans.find((p) => p.code === planCode) ?? plans[0];
  const base = period === "yearly" ? plan.inrYearly : plan.inrMonthly;
  const gst = Math.round((base * settings.gstRate) / 100);

  async function pay() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.code, period }),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    if (!res?.ok || !json?.ok) {
      setBusy(false);
      setError(json?.error ?? "Couldn't start checkout. Please try again.");
      return;
    }
    const opts = json as CheckoutOptions;
    if (!(await loadRazorpay()) || !window.Razorpay) {
      setBusy(false);
      setError("Couldn't load Razorpay. Check your connection and try again.");
      return;
    }
    const rzp = new window.Razorpay({
      key: opts.keyId,
      subscription_id: opts.subscriptionId,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: "#3730A3" },
      modal: { ondismiss: () => setBusy(false) },
      handler: async (r: RazorpayResponse) => {
        const v = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r),
        }).catch(() => null);
        // Even if this check is slow, the webhook will activate the subscription.
        router.push(v?.ok ? "/account?welcome=1" : "/account?pending=1");
      },
    });
    rzp.on("payment.failed", () => {
      setBusy(false);
      setError("The payment didn't go through. Please try another card or UPI app.");
    });
    rzp.open();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Section n={1} title="Billing details" done={step === "pay"} onEdit={() => setStep("billing")}>
          {step === "billing" ? (
            <BillingForm initial={billing} submitLabel="Continue" onSaved={() => { setStep("pay"); router.refresh(); }} />
          ) : (
            <p className="text-sm text-muted">Saved. These appear on your GST invoices.</p>
          )}
        </Section>

        <Section n={2} title="Plan and payment" muted={step !== "pay"}>
          {step === "pay" && (
            <div className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {plans.map((p) => (
                  <label
                    key={p.code}
                    className={clsx(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3",
                      p.code === plan.code ? "border-brand-ink ring-2 ring-brand-ink/30" : "border-line",
                    )}
                  >
                    <span>
                      <input
                        type="radio"
                        name="plan"
                        value={p.code}
                        checked={p.code === plan.code}
                        onChange={() => setPlanCode(p.code)}
                        className="sr-only"
                      />
                      <span className="block font-semibold text-ink">{p.name}</span>
                      <span className="text-xs text-muted">{formatMoney(p.inrMonthly, "INR")}/month</span>
                    </span>
                    {p.code === plan.code && <Check className="h-5 w-5 text-brand-ink" aria-hidden="true" />}
                  </label>
                ))}
              </div>
              <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-xl border border-line p-1">
                {(["monthly", "yearly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={period === p}
                    onClick={() => setPeriod(p)}
                    className={clsx(
                      "rounded-lg px-3.5 py-2 text-sm font-semibold",
                      period === p ? "bg-brand text-white" : "text-muted hover:text-ink",
                    )}
                  >
                    {p === "monthly" ? "Monthly" : "Yearly · 2 months free"}
                  </button>
                ))}
              </div>
              {error && <FormError message={error} />}
              <button type="button" onClick={pay} disabled={busy} className={`${buttonClass("primary", "lg")} w-full`}>
                <Lock className="h-4 w-4" aria-hidden="true" />
                {busy ? "Opening secure checkout…" : trialEligible ? `Start ${settings.trialDays}-day free trial` : "Subscribe"}
              </button>
              <p className="text-center text-xs text-muted">
                Secure payment by Razorpay · UPI, cards and netbanking · Cancel anytime from your account
              </p>
            </div>
          )}
        </Section>
      </div>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold text-ink">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label={`${plan.name} (${period})`} value={formatMoney(base, "INR")} />
          <Row label={`GST ${settings.gstRate}%`} value={formatMoney(gst, "INR")} />
          <div className="border-t border-line pt-2">
            <Row label={`Total per ${period === "yearly" ? "year" : "month"}`} value={formatMoney(base + gst, "INR")} strong />
          </div>
        </dl>
        {trialEligible && (
          <p className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
            Today you pay nothing. Your first charge is after {settings.trialDays} days. Razorpay may place a small,
            refunded authorisation to set up the payment.
          </p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={clsx("flex justify-between gap-3", strong ? "font-semibold text-ink" : "text-muted")}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Section({
  n,
  title,
  done,
  muted,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  muted?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx("card p-5 sm:p-6", muted && "opacity-60")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 font-semibold text-ink">
          <span
            className={clsx(
              "flex h-7 w-7 items-center justify-center rounded-full text-sm",
              done ? "bg-success text-white" : "bg-brand-soft text-brand-ink",
            )}
          >
            {done ? <Check className="h-4 w-4" aria-hidden="true" /> : n}
          </span>
          {title}
        </h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="text-sm font-medium text-brand-ink hover:underline">
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
