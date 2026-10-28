"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, BusyLabel } from "../ui";
import { FormError } from "../forms/field";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function PlanActions({
  plans,
  currentPlan,
  currentPeriod,
  canChange,
  canCancel,
}: {
  plans: Plan[];
  currentPlan: string;
  currentPeriod: "monthly" | "yearly";
  canChange: boolean;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "change" | "cancel">("idle");
  const [plan, setPlan] = useState(currentPlan);
  const [period, setPeriod] = useState(currentPeriod);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function post(url: string, body?: object) {
    setBusy(true);
    setError(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok || !json?.ok) {
      setError(json?.error ?? "Something went wrong. Please try again.");
      return null;
    }
    return json;
  }

  return (
    <div className="mt-5">
      {message && (
        <p role="status" className="mb-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          {message}
        </p>
      )}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          {canChange && (
            <button type="button" className={buttonClass("secondary")} onClick={() => setMode("change")}>
              Upgrade or downgrade
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={() => setMode("cancel")}
            >
              Cancel subscription
            </button>
          )}
        </div>
      )}

      {mode === "change" && (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await post("/api/subscription/change", { plan, period });
            if (r) {
              setMode("idle");
              setMessage(r.when === "now" ? "Upgraded. The new plan is active now." : "Done. The new plan starts at your next renewal.");
              router.refresh();
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="chg-plan">
                New plan
              </label>
              <select id="chg-plan" className="input" value={plan} onChange={(e) => setPlan(e.target.value)}>
                {plans.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} — {formatMoney(p.inrMonthly, "INR")}/month
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="chg-period">
                Billing
              </label>
              <select
                id="chg-period"
                className="input"
                value={period}
                onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly")}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly (2 months free)</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted">Upgrades apply now and you pay the difference. Downgrades start at your next renewal.</p>
          {error && <FormError message={error} />}
          <div className="flex gap-2">
            <button type="submit" className={buttonClass("primary")} disabled={busy}>
              <BusyLabel busy={busy} busyText="Changing…">Change plan</BusyLabel>
            </button>
            <button type="button" className={buttonClass("ghost")} onClick={() => setMode("idle")}>
              Back
            </button>
          </div>
        </form>
      )}

      {mode === "cancel" && (
        <div className="space-y-3 rounded-xl border border-line bg-bg p-4">
          <p className="text-sm text-ink">
            Are you sure? If you&rsquo;ve paid for the current period, you keep access until it ends and won&rsquo;t be
            charged again. During a free trial, the subscription ends now.
          </p>
          {error && <FormError message={error} />}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60 disabled:has-[[data-busy]]:cursor-wait disabled:has-[[data-busy]]:opacity-85"
              disabled={busy}
              onClick={async () => {
                const r = await post("/api/subscription/cancel");
                if (r) {
                  setMode("idle");
                  setMessage(r.atCycleEnd ? "Cancelled. You keep access until the end of this period." : "Cancelled.");
                  router.refresh();
                }
              }}
            >
              <BusyLabel busy={busy} busyText="Cancelling…">Yes, cancel</BusyLabel>
            </button>
            <button type="button" className={buttonClass("secondary")} onClick={() => setMode("idle")}>
              Keep my plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
