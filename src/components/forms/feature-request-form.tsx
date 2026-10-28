"use client";

import { CheckCircle2 } from "lucide-react";
import { buttonClass, BusyLabel } from "../ui";
import { Field, FormError, Honeypot, errProps } from "./field";
import { useSubmit } from "./use-submit";
import { Turnstile } from "./turnstile";

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
      <Field id="fr-request" label="What should Maa One do?" error={errors.request}>
        <textarea
          id="fr-request"
          name="request"
          rows={4}
          className="input"
          placeholder="e.g. Send a WhatsApp reminder a day before each booking. I run a salon and today I call everyone."
          required
          {...errProps("fr-request", errors.request)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field id="fr-name" label="Name (optional)">
          <input id="fr-name" name="name" className="input" autoComplete="name" />
        </Field>
        <Field id="fr-email" label="Email (optional)" hint="So we can tell you when it ships." error={errors.email}>
          <input id="fr-email" name="email" type="email" className="input" autoComplete="email" {...errProps("fr-email", errors.email)} />
        </Field>
      </div>
      <Turnstile />
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={buttonClass("primary")} disabled={state.status === "submitting"}>
        <BusyLabel busy={state.status === "submitting"} busyText="Sending…">Request this feature</BusyLabel>
      </button>
    </form>
  );
}
