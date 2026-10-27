"use client";

import { useRouter } from "next/navigation";
import { buttonClass } from "../ui";
import { Field, FormError, errProps } from "../forms/field";
import { useSubmit } from "../forms/use-submit";

export function SupportForm() {
  const router = useRouter();
  const { state, errors, onSubmit } = useSubmit("/api/support");

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
        Thanks — we&rsquo;ve got your message and will reply here.{" "}
        <button type="button" className="font-semibold underline" onClick={() => router.refresh()}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="t-subject" label="Subject" error={errors.subject}>
        <input id="t-subject" name="subject" className="input" required {...errProps("t-subject", errors.subject)} />
      </Field>
      <Field id="t-message" label="How can we help?" error={errors.message}>
        <textarea id="t-message" name="message" rows={4} className="input" required {...errProps("t-message", errors.message)} />
      </Field>
      {state.status === "error" && <FormError message={state.message} />}
      <button type="submit" className={buttonClass("primary")} disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Send to support"}
      </button>
    </form>
  );
}
