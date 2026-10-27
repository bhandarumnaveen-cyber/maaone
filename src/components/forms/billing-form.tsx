"use client";

import { useState } from "react";
import { buttonClass } from "../ui";
import { Field, FormError, errProps } from "./field";
import { indianStates } from "@/lib/states";
import type { FieldErrors } from "@/lib/validation";

export type Billing = {
  business_name: string;
  gstin: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

export function BillingForm({
  initial,
  submitLabel = "Save billing details",
  onSaved,
}: {
  initial: Billing | null;
  submitLabel?: string;
  onSaved?: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrors({});
    setError(null);
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    if (res?.ok && json?.ok) {
      setStatus("saved");
      onSaved?.();
      return;
    }
    setStatus("idle");
    if (res?.status === 422 && json?.errors) setErrors(json.errors);
    else setError(json?.error ?? "Couldn't save. Please try again.");
  }

  const v = (k: keyof Billing) => initial?.[k] ?? "";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" onChange={() => status === "saved" && setStatus("idle")}>
      <Field id="b-name" label="Business name (as on invoice)" error={errors.business_name}>
        <input id="b-name" name="business_name" className="input" defaultValue={v("business_name")} autoComplete="organization" required {...errProps("b-name", errors.business_name)} />
      </Field>
      <Field id="b-gstin" label="GSTIN (optional)" hint="Add it to claim input tax credit." error={errors.gstin}>
        <input id="b-gstin" name="gstin" className="input uppercase" defaultValue={v("gstin")} maxLength={15} placeholder="03ABCDE1234F1Z5" {...errProps("b-gstin", errors.gstin)} />
      </Field>
      <Field id="b-a1" label="Address" error={errors.address_line1}>
        <input id="b-a1" name="address_line1" className="input" defaultValue={v("address_line1")} autoComplete="address-line1" required {...errProps("b-a1", errors.address_line1)} />
      </Field>
      <Field id="b-a2" label="Address line 2 (optional)">
        <input id="b-a2" name="address_line2" className="input" defaultValue={v("address_line2")} autoComplete="address-line2" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="b-city" label="City" error={errors.city}>
          <input id="b-city" name="city" className="input" defaultValue={v("city")} autoComplete="address-level2" required {...errProps("b-city", errors.city)} />
        </Field>
        <Field id="b-state" label="State" error={errors.state}>
          <select id="b-state" name="state" className="input" defaultValue={v("state")} required {...errProps("b-state", errors.state)}>
            <option value="" disabled>
              Choose
            </option>
            {indianStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field id="b-pin" label="PIN code" error={errors.pincode}>
          <input id="b-pin" name="pincode" className="input" inputMode="numeric" maxLength={6} defaultValue={v("pincode")} autoComplete="postal-code" required {...errProps("b-pin", errors.pincode)} />
        </Field>
      </div>
      {error && <FormError message={error} />}
      <div className="flex items-center gap-3">
        <button type="submit" className={buttonClass("primary")} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : submitLabel}
        </button>
        {status === "saved" && !onSaved && (
          <span role="status" className="text-sm font-medium text-success">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
