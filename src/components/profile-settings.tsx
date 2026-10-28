"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, MonitorSmartphone } from "lucide-react";
import { buttonClass } from "./ui";
import { Field, FormError, errProps } from "./forms/field";
import type { FieldErrors } from "@/lib/validation";

async function postJson(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  const json = await res?.json().catch(() => ({}));
  return { ok: Boolean(res?.ok && json?.ok), status: res?.status ?? 0, json: json ?? {} };
}

function Saved({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {children}
    </p>
  );
}

/** Name, phone, login email and sessions — used on /admin/profile and /account/profile. */
export function ProfileSettings({
  fullName,
  phone,
  email,
  loginPhone,
}: {
  fullName: string;
  phone: string;
  email: string | null;
  loginPhone: string | null;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const [emailErrors, setEmailErrors] = useState<FieldErrors>({});
  const [emailState, setEmailState] = useState<"idle" | "saving" | "sent">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    setErrors({});
    setError(null);
    const r = await postJson("/api/profile", Object.fromEntries(new FormData(e.currentTarget)));
    if (r.ok) {
      setState("saved");
      router.refresh();
      return;
    }
    setState("idle");
    if (r.status === 422) setErrors(r.json.errors ?? {});
    else setError(r.json.error ?? "Couldn't save. Please try again.");
  }

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailState("saving");
    setEmailErrors({});
    setEmailError(null);
    const r = await postJson("/api/profile/email", Object.fromEntries(new FormData(e.currentTarget)));
    if (r.ok) return setEmailState("sent");
    setEmailState("idle");
    if (r.status === 422) setEmailErrors(r.json.errors ?? {});
    else setEmailError(r.json.error ?? "Couldn't start the email change. Please try again.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className="card p-5 shadow-sm sm:p-6" aria-labelledby="personal-title">
          <h2 id="personal-title" className="text-base font-semibold text-ink">
            Personal details
          </h2>
          <p className="mt-0.5 text-sm text-muted">How we greet you and reach you.</p>
          <form onSubmit={saveProfile} noValidate className="mt-5 space-y-4" onChange={() => state === "saved" && setState("idle")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="p-name" label="Full name" error={errors.full_name}>
                <input id="p-name" name="full_name" className="input" defaultValue={fullName} autoComplete="name" required {...errProps("p-name", errors.full_name)} />
              </Field>
              <Field id="p-phone" label="Mobile / WhatsApp" error={errors.phone}>
                <input
                  id="p-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="input"
                  defaultValue={phone}
                  autoComplete="tel"
                  placeholder="98765 43210"
                  {...errProps("p-phone", errors.phone)}
                />
              </Field>
            </div>
            {error && <FormError message={error} />}
            <div className="flex items-center gap-3">
              <button type="submit" className={buttonClass("primary")} disabled={state === "saving"}>
                {state === "saving" ? "Saving…" : "Save changes"}
              </button>
              {state === "saved" && <Saved>Saved</Saved>}
            </div>
          </form>
        </section>

        <section className="card p-5 shadow-sm sm:p-6" aria-labelledby="login-title">
          <h2 id="login-title" className="text-base font-semibold text-ink">
            Login email
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {email ? (
              <>
                You log in with <strong className="text-ink">{email}</strong>
              </>
            ) : (
              <>You log in with your phone {loginPhone}. Add an email to log in with either.</>
            )}
          </p>
          {emailState === "sent" ? (
            <p role="status" className="mt-5 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
              Check both inboxes. The change happens after you confirm the link we sent.
            </p>
          ) : (
            <form onSubmit={changeEmail} noValidate className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <label htmlFor="p-email" className="sr-only">
                  New email address
                </label>
                <input
                  id="p-email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="new@business.in"
                  autoComplete="email"
                  required
                  {...errProps("p-email", emailErrors.email)}
                />
                {emailErrors.email && (
                  <p id="p-email-error" className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                    {emailErrors.email}
                  </p>
                )}
              </div>
              <button type="submit" className={buttonClass("secondary")} disabled={emailState === "saving"}>
                {emailState === "saving" ? "Sending…" : email ? "Change email" : "Add email"}
              </button>
            </form>
          )}
          {emailError && (
            <div className="mt-3">
              <FormError message={emailError} />
            </div>
          )}
        </section>
      </div>

      <section className="card h-fit p-5 shadow-sm sm:p-6" aria-labelledby="sessions-title">
        <h2 id="sessions-title" className="text-base font-semibold text-ink">
          Sessions
        </h2>
        <p className="mt-0.5 text-sm text-muted">Log out here, or from every phone and computer at once.</p>
        <div className="mt-5 space-y-3">
          <form action="/auth/signout" method="post">
            <button type="submit" className={`${buttonClass("primary")} w-full`}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </form>
          <form action="/auth/signout" method="post">
            <input type="hidden" name="scope" value="global" />
            <button type="submit" className={`${buttonClass("secondary")} w-full`}>
              <MonitorSmartphone className="h-4 w-4" aria-hidden="true" /> Log out of all devices
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
