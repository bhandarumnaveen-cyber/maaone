"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { normalisePhone } from "@/lib/validation";
import { BusyLabel, buttonClass } from "../ui";
import { startNavigationProgress } from "../navigation-progress";
import { Field, FormError } from "./field";

type Method = "email" | "phone";

export function OtpLogin({ next }: { next: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [identifier, setIdentifier] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = method === "email" ? identifier.trim().toLowerCase() : normalisePhone(identifier);
    if (!value || (method === "email" && !value.includes("@"))) {
      setError(method === "email" ? "Please enter a valid email address." : "Please enter a valid mobile number.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } =
      method === "email"
        ? await supabase.auth.signInWithOtp({ email: value })
        : await supabase.auth.signInWithOtp({ phone: value });
    setBusy(false);
    if (error) setError(error.message);
    else setSentTo(value);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!sentTo) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const token = code.replace(/\s/g, "");
    const { error } =
      method === "email"
        ? await supabase.auth.verifyOtp({ email: sentTo, token, type: "email" })
        : await supabase.auth.verifyOtp({ phone: sentTo, token, type: "sms" });
    if (error) {
      setBusy(false);
      setError("That code didn't work. Check it and try again, or request a new one.");
      return;
    }
    // Stay busy until the next page replaces this one, so the button doesn't flash back to "Log in".
    setLoggedIn(true);
    startNavigationProgress();
    router.replace(next);
    router.refresh();
  }

  if (sentTo) {
    return (
      <form onSubmit={verify} className="card space-y-4 p-5 sm:p-6">
        <p className="text-sm text-muted">
          We sent a code to <strong className="text-ink">{sentTo}</strong>.
        </p>
        <Field id="otp" label="Enter the code">
          <input
            id="otp"
            className="input text-center text-2xl tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            required
          />
        </Field>
        {error && <FormError message={error} />}
        <button type="submit" className={`${buttonClass("primary", "lg")} w-full`} disabled={busy || code.length < 6}>
          <BusyLabel busy={busy} busyText={loggedIn ? "Logging you in…" : "Checking…"}>
            Log in
          </BusyLabel>
        </button>
        <button
          type="button"
          className="w-full text-sm font-medium text-brand-ink hover:underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            setSentTo(null);
            setCode("");
          }}
        >
          Use a different {method === "email" ? "email" : "number"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="card space-y-4 p-5 sm:p-6">
      <div role="radiogroup" aria-label="Log in with" className="grid grid-cols-2 rounded-xl border border-line p-1">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={method === m}
            onClick={() => {
              setMethod(m);
              setIdentifier("");
              setError(null);
            }}
            className={clsx(
              "rounded-lg py-2 text-sm font-semibold",
              method === m ? "bg-brand text-white" : "text-muted hover:text-ink",
            )}
          >
            {m === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>
      <Field id="identifier" label={method === "email" ? "Email" : "Mobile number"}>
        <input
          id="identifier"
          className="input"
          type={method === "email" ? "email" : "tel"}
          inputMode={method === "email" ? "email" : "tel"}
          autoComplete={method === "email" ? "email" : "tel"}
          placeholder={method === "email" ? "you@business.in" : "98765 43210"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </Field>
      {error && <FormError message={error} />}
      <button type="submit" className={`${buttonClass("primary", "lg")} w-full`} disabled={busy}>
        <BusyLabel busy={busy} busyText="Sending code…">
          Send login code
        </BusyLabel>
      </button>
    </form>
  );
}
