"use client";

import { useEffect, useState } from "react";
import { readAttribution } from "../attribution";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { WhatsAppIcon } from "../icons";
import { site } from "@/site.config";
import { buttonClass, BusyLabel } from "../ui";
import { Field, FormError, Honeypot, errProps } from "./field";
import { useSubmit } from "./use-submit";
import { Turnstile } from "./turnstile";
import { useSettings } from "../settings-provider";
import { businessTypes } from "@/site.config";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function WaitlistForm({
  plans,
  defaultPlan,
  referral,
  utm,
}: {
  plans: Plan[];
  defaultPlan: string;
  referral?: string;
  utm?: string;
}) {
  const { state, errors, onSubmit } = useSubmit("/api/waitlist");
  const { launchDateLabel } = useSettings();
  // Fall back to a referral/campaign seen earlier in this visit (e.g. landed on the home page first).
  const [attr, setAttr] = useState<{ ref?: string; utm?: string }>({ ref: referral, utm });
  useEffect(() => {
    if (!referral && !utm) setAttr(readAttribution());
  }, [referral, utm]);

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
        {state.position ? <ShareReferral position={state.position} /> : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative space-y-4 p-5 sm:p-8">
      <Honeypot />
      {attr.ref && <input type="hidden" name="ref" value={attr.ref} />}
      {attr.utm && <input type="hidden" name="utm" value={attr.utm} />}
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
      <Turnstile />
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={`${buttonClass("primary", "lg")} w-full`} disabled={state.status === "submitting"}>
        <BusyLabel busy={state.status === "submitting"} busyText="Joining…">Join the waitlist</BusyLabel>
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

/** Personal referral link with WhatsApp share and copy. */
function ShareReferral({ position }: { position: number }) {
  const [copied, setCopied] = useState(false);
  const link = `${site.url}/waitlist?ref=${position}`;
  const message = `I just joined the waitlist for Maa One — every WhatsApp and website lead in one inbox, with AI replies in Hindi, Punjabi and English. Join here: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your link", link);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-bg p-5 text-left">
      <p className="font-semibold text-ink">Know other business owners?</p>
      <p className="mt-1 text-sm text-muted">
        Share your personal link. Businesses that bring others get invited to the pilot first.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{link.replace("https://", "")}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-soft"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E7A3E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B6532]"
      >
        <WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp
      </a>
    </div>
  );
}
