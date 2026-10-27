"use client";

import { CheckCircle2 } from "lucide-react";
import { buttonClass } from "../ui";
import { Field, FormError, Honeypot, errProps } from "./field";
import { useSubmit } from "./use-submit";
import { useSettings } from "../settings-provider";
import { businessTypes } from "@/site.config";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function WaitlistForm({ plans, defaultPlan }: { plans: Plan[]; defaultPlan: string }) {
  const { state, errors, onSubmit } = useSubmit("/api/waitlist");
  const { launchDateLabel } = useSettings();

  if (state.status === "success") {
    return (
      <div role="status" className="card p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-ink">
          {state.alreadyJoined ? "You were already on the list!" : "You\u2019re on the list!"}
        </h2>
        {state.position ? (
          <p className="mt-2 text-lg text-ink">
            Your waitlist position: <strong className="text-brand-ink">#{state.position}</strong>
          </p>
        ) : null}
        <p className="mt-2 text-muted">
          We&rsquo;ll write to you before the pilot and again on launch day, {launchDateLabel}.
        </p>
        {state.preview && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-ink">
            Preview mode: this form is validated but not saved yet. Saving is switched on in Phase 2.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative space-y-4 p-5 sm:p-8">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <input id="name" name="name" className="input" autoComplete="name" required {...errProps("name", errors.name)} />
        </Field>
        <Field id="businessName" label="Business name" error={errors.businessName}>
          <input
            id="businessName"
            name="businessName"
            className="input"
            autoComplete="organization"
            required
            {...errProps("businessName", errors.businessName)}
          />
        </Field>
        <Field id="businessType" label="Business type" error={errors.businessType}>
          <select
            id="businessType"
            name="businessType"
            className="input"
            defaultValue=""
            required
            {...errProps("businessType", errors.businessType)}
          >
            <option value="" disabled>
              Choose one
            </option>
            {businessTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="city" label="City" error={errors.city}>
          <input id="city" name="city" className="input" autoComplete="address-level2" required {...errProps("city", errors.city)} />
        </Field>
        <Field id="phone" label="Mobile / WhatsApp number" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="input"
            autoComplete="tel"
            placeholder="98765 43210"
            required
            {...errProps("phone", errors.phone)}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            required
            {...errProps("email", errors.email)}
          />
        </Field>
      </div>
      <Field id="plan" label="Plan you're interested in" error={errors.plan}>
        <select id="plan" name="plan" className="input" defaultValue={defaultPlan} {...errProps("plan", errors.plan)}>
          <option value="">Not sure yet</option>
          {plans.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} — {formatMoney(p.inrMonthly, "INR")}/month
            </option>
          ))}
        </select>
      </Field>
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={`${buttonClass("primary", "lg")} w-full`} disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Joining…" : "Join the waitlist"}
      </button>
      <p className="text-center text-xs text-muted">
        No payment needed. We&rsquo;ll only contact you about Maa One. See our{" "}
        <a href="/privacy" className="font-medium text-brand-ink underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
