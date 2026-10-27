"use client";

import { CheckCircle2 } from "lucide-react";
import { buttonClass } from "../ui";
import { Field, FormError, Honeypot, errProps } from "./field";
import { useSubmit } from "./use-submit";

export function FeatureRequestForm() {
  const { state, errors, onSubmit } = useSubmit("/api/feature-request");

  if (state.status === "success") {
    return (
      <div role="status" className="card p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-ink">Thank you — request received.</p>
        <p className="mt-1 text-sm text-muted">Naveen reads every request when planning the next version.</p>
        {state.preview && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-ink">
            Preview mode: this form is validated but not saved yet. Saving is switched on in Phase 2.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative space-y-4 p-5 sm:p-6">
      <Honeypot />
      <Field id="fr-title" label="What should Maa One do?" error={errors.title}>
        <input
          id="fr-title"
          name="title"
          className="input"
          placeholder="e.g. Send a WhatsApp reminder a day before each booking"
          required
          {...errProps("fr-title", errors.title)}
        />
      </Field>
      <Field id="fr-details" label="Tell us more (optional)">
        <textarea id="fr-details" name="details" rows={4} className="input" placeholder="Your business, how you'd use it, what you do today…" />
      </Field>
      <Field id="fr-email" label="Email (optional)" hint="So we can tell you when it ships." error={errors.email}>
        <input id="fr-email" name="email" type="email" className="input" autoComplete="email" {...errProps("fr-email", errors.email)} />
      </Field>
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={buttonClass("primary")} disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Request this feature"}
      </button>
    </form>
  );
}
