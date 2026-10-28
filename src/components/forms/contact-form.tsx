"use client";

import { CheckCircle2 } from "lucide-react";
import { buttonClass, BusyLabel } from "../ui";
import { Field, FormError, Honeypot, errProps } from "./field";
import { useSubmit } from "./use-submit";
import { Turnstile } from "./turnstile";

const topics = ["General question", "Sales and pricing", "Partnership", "Support", "Other"];

export function ContactForm() {
  const { state, errors, onSubmit } = useSubmit("/api/contact");

  if (state.status === "success") {
    return (
      <div role="status" className="card p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-ink">Message sent</h2>
        <p className="mt-2 text-muted">Thank you! We usually reply within one working day.</p>
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
        <Field id="c-name" label="Your name" error={errors.name}>
          <input id="c-name" name="name" className="input" autoComplete="name" required {...errProps("c-name", errors.name)} />
        </Field>
        <Field id="c-email" label="Email" error={errors.email}>
          <input id="c-email" name="email" type="email" className="input" autoComplete="email" required {...errProps("c-email", errors.email)} />
        </Field>
        <Field id="c-phone" label="Phone (optional)" error={errors.phone}>
          <input id="c-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" {...errProps("c-phone", errors.phone)} />
        </Field>
        <Field id="c-topic" label="Topic">
          <select id="c-topic" name="topic" className="input" defaultValue={topics[0]}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="c-message" label="Message" error={errors.message}>
        <textarea id="c-message" name="message" rows={5} className="input" required {...errProps("c-message", errors.message)} />
      </Field>
      <Turnstile />
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={`${buttonClass("primary", "lg")} w-full sm:w-auto`} disabled={state.status === "submitting"}>
        <BusyLabel busy={state.status === "submitting"} busyText="Sending…">Send message</BusyLabel>
      </button>
    </form>
  );
}
