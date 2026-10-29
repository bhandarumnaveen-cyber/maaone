"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { buttonClass, BusyLabel } from "../ui";
import { Field, FormError, errProps } from "../forms/field";
import { useSubmit } from "../forms/use-submit";

/** "Request a refund" for one invoice: opens a short form; the request becomes a support ticket. */
export function RefundRequest({ invoiceId, invoiceNumber, pending }: { invoiceId: string; invoiceNumber: string; pending: boolean }) {
  const [open, setOpen] = useState(false);
  const { state, errors, onSubmit } = useSubmit("/api/refund-request");

  if (pending || state.status === "success") {
    return (
      <p role="status" className="w-full rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
        Refund requested for {invoiceNumber}. We&rsquo;ll reply within 2 working days — see <a href="/account/support" className="font-semibold underline">Support</a>.
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand-ink">
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Request a refund
      </button>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="w-full space-y-3 rounded-xl border border-line bg-bg p-4">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <Field id={`r-${invoiceId}`} label={`Why would you like a refund for ${invoiceNumber}?`} error={errors.reason}>
        <textarea id={`r-${invoiceId}`} name="reason" rows={3} className="input" required {...errProps(`r-${invoiceId}`, errors.reason)} />
      </Field>
      <p className="text-xs text-muted">
        We reply within 2 working days. Approved refunds go back to your original payment method in 5–7 working days.{" "}
        <a href="/refund-policy" className="underline">Refund policy</a>
      </p>
      {state.status === "error" && <FormError message={state.message} />}
      <div className="flex gap-2">
        <button type="submit" className={buttonClass("primary")} disabled={state.status === "submitting"}>
          <BusyLabel busy={state.status === "submitting"} busyText="Sending…">Send request</BusyLabel>
        </button>
        <button type="button" className={buttonClass("ghost")} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
