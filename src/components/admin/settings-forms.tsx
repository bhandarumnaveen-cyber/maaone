"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { buttonClass } from "../ui";
import { Field, FormError, errProps } from "../forms/field";
import { indianStates } from "@/lib/states";
import type { FieldErrors } from "@/lib/validation";

async function save(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  const json = await res?.json().catch(() => ({}));
  return { ok: Boolean(res?.ok && json?.ok), status: res?.status ?? 0, json: json ?? {} };
}

function useSaver(url: string) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  async function submit(body: object) {
    setState("saving");
    setErrors({});
    setError(null);
    const r = await save(url, body);
    if (r.ok) {
      setState("saved");
      router.refresh();
      return;
    }
    setState("idle");
    if (r.status === 422) setErrors(r.json.errors ?? {});
    else setError(r.json.error ?? "Couldn't save. Please try again.");
  }
  return { errors, state, error, submit, reset: () => state === "saved" && setState("idle") };
}

function SaveBar({ state, error }: { state: "idle" | "saving" | "saved"; error: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
      <button type="submit" className={buttonClass("primary")} disabled={state === "saving"}>
        {state === "saving" ? "Saving…" : "Save changes"}
      </button>
      {state === "saved" && (
        <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Saved — live on the website now
        </span>
      )}
      {error && <FormError message={error} />}
    </div>
  );
}

export type SiteSettingsValues = {
  sales_open: boolean;
  launch_date: string;
  trial_days: number;
  gst_rate: number;
  company_state: string;
  support_email: string;
  naveencodes_email: string;
  whatsapp: string;
  instagram: string;
  app_url: string;
};

export function SiteSettingsForm({ initial, razorpayReady }: { initial: SiteSettingsValues; razorpayReady: boolean }) {
  const { errors, state, error, submit, reset } = useSaver("/api/admin/settings");
  const [salesOpen, setSalesOpen] = useState(initial.sales_open);

  return (
    <form
      noValidate
      onChange={reset}
      onSubmit={(e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget));
        submit({ ...f, sales_open: salesOpen });
      }}
      className="space-y-6"
    >
      <div className={clsx("rounded-2xl border p-5", salesOpen ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "border-line bg-bg")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-ink">Sales open</p>
            <p className="mt-1 text-sm text-muted">
              Off: every buy button says &ldquo;Join the waitlist&rdquo;. On: visitors can start a free trial and pay with Razorpay.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={salesOpen}
            aria-label="Sales open"
            onClick={() => setSalesOpen((v) => !v)}
            className={clsx("relative h-7 w-12 shrink-0 rounded-full transition-colors", salesOpen ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600")}
          >
            <span className={clsx("absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform", salesOpen && "translate-x-5")} />
          </button>
        </div>
        {salesOpen && !razorpayReady && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Razorpay keys aren&rsquo;t set on the server yet, so checkout won&rsquo;t work. Add them before opening sales.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="s-launch" label="Launch date" error={errors.launch_date}>
          <input id="s-launch" name="launch_date" type="date" className="input" defaultValue={initial.launch_date} {...errProps("s-launch", errors.launch_date)} />
        </Field>
        <Field id="s-trial" label="Free trial (days)" error={errors.trial_days}>
          <input id="s-trial" name="trial_days" type="number" min={0} max={90} className="input" defaultValue={initial.trial_days} {...errProps("s-trial", errors.trial_days)} />
        </Field>
        <Field id="s-gst" label="GST rate (%)" hint="Used on invoices." error={errors.gst_rate}>
          <input id="s-gst" name="gst_rate" type="number" min={0} max={28} step="0.01" className="input" defaultValue={initial.gst_rate} {...errProps("s-gst", errors.gst_rate)} />
        </Field>
      </div>

      <Field id="s-state" label="State of GST registration" hint="Same state as the customer → CGST + SGST, otherwise IGST." error={errors.company_state}>
        <select id="s-state" name="company_state" className="input" defaultValue={initial.company_state} {...errProps("s-state", errors.company_state)}>
          {indianStates.map((st) => (
            <option key={st}>{st}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="s-support" label="Support email" error={errors.support_email}>
          <input id="s-support" name="support_email" type="email" className="input" defaultValue={initial.support_email} {...errProps("s-support", errors.support_email)} />
        </Field>
        <Field id="s-nc" label="NaveenCodes email" error={errors.naveencodes_email}>
          <input id="s-nc" name="naveencodes_email" type="email" className="input" defaultValue={initial.naveencodes_email} {...errProps("s-nc", errors.naveencodes_email)} />
        </Field>
        <Field id="s-wa" label="WhatsApp number" hint="International format, e.g. +918053385815" error={errors.whatsapp}>
          <input id="s-wa" name="whatsapp" type="tel" className="input" defaultValue={initial.whatsapp} {...errProps("s-wa", errors.whatsapp)} />
        </Field>
        <Field id="s-ig" label="Instagram handle" error={errors.instagram}>
          <input id="s-ig" name="instagram" className="input" defaultValue={initial.instagram} {...errProps("s-ig", errors.instagram)} />
        </Field>
      </div>

      <Field id="s-app" label="Maa One app address" hint="Where “Open Maa One” buttons go. While this is the website's own address, they show “App opens on <launch date>”." error={errors.app_url}>
        <input id="s-app" name="app_url" type="url" className="input" defaultValue={initial.app_url} placeholder="https://app.maalabs.in" {...errProps("s-app", errors.app_url)} />
      </Field>

      <SaveBar state={state} error={error} />
    </form>
  );
}

export type PlanValues = {
  code: string;
  name: string;
  tagline: string | null;
  price_inr_monthly: number;
  price_inr_yearly: number;
  price_usd_monthly: number;
  price_usd_yearly: number;
  max_users: number | null;
  max_businesses: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  razorpay_plan_id_monthly: string | null;
  razorpay_plan_id_yearly: string | null;
};

const major = (minor: number) => String(minor / 100);

export function PlanForm({ plan, gstRate }: { plan: PlanValues; gstRate: number }) {
  const { errors, state, error, submit, reset } = useSaver("/api/admin/plans");
  const [popular, setPopular] = useState(plan.is_popular);
  const [active, setActive] = useState(plan.is_active);
  const [monthly, setMonthly] = useState(major(plan.price_inr_monthly));
  const [yearly, setYearly] = useState(major(plan.price_inr_yearly));
  const id = (k: string) => `p-${plan.code}-${k}`;
  const withGst = (v: string) => {
    const n = Math.round(Number(v) * (1 + gstRate / 100) * 100) / 100;
    return n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };

  return (
    <form
      noValidate
      onChange={reset}
      onSubmit={(e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        submit({
          ...f,
          code: plan.code,
          features: (f.features ?? "").split("\n"),
          is_popular: popular,
          is_active: active,
        });
      }}
      className="card space-y-5 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">
          {plan.name} <span className="text-sm font-normal text-muted">({plan.code})</span>
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-ink">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
            Shown on the website
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-ink">
            <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
            &ldquo;Most popular&rdquo; badge
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("name")} label="Name" error={errors.name}>
          <input id={id("name")} name="name" className="input" defaultValue={plan.name} {...errProps(id("name"), errors.name)} />
        </Field>
        <Field id={id("tag")} label="Tagline">
          <input id={id("tag")} name="tagline" className="input" defaultValue={plan.tagline ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id={id("im")} label="₹ per month (excl. GST)" hint={`₹${withGst(monthly)} with GST`} error={errors.price_inr_monthly}>
          <input id={id("im")} name="price_inr_monthly" type="number" min={0} step="1" className="input" value={monthly} onChange={(e) => setMonthly(e.target.value)} {...errProps(id("im"), errors.price_inr_monthly)} />
        </Field>
        <Field id={id("iy")} label="₹ per year (excl. GST)" hint={`₹${withGst(yearly)} with GST`} error={errors.price_inr_yearly}>
          <input id={id("iy")} name="price_inr_yearly" type="number" min={0} step="1" className="input" value={yearly} onChange={(e) => setYearly(e.target.value)} {...errProps(id("iy"), errors.price_inr_yearly)} />
        </Field>
        <Field id={id("um")} label="$ per month" error={errors.price_usd_monthly}>
          <input id={id("um")} name="price_usd_monthly" type="number" min={0} step="1" className="input" defaultValue={major(plan.price_usd_monthly)} {...errProps(id("um"), errors.price_usd_monthly)} />
        </Field>
        <Field id={id("uy")} label="$ per year" error={errors.price_usd_yearly}>
          <input id={id("uy")} name="price_usd_yearly" type="number" min={0} step="1" className="input" defaultValue={major(plan.price_usd_yearly)} {...errProps(id("uy"), errors.price_usd_yearly)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("mu")} label="Max users" hint="Leave blank for no fixed limit." error={errors.max_users}>
          <input id={id("mu")} name="max_users" type="number" min={1} className="input" defaultValue={plan.max_users ?? ""} {...errProps(id("mu"), errors.max_users)} />
        </Field>
        <Field id={id("mb")} label="Max businesses" error={errors.max_businesses}>
          <input id={id("mb")} name="max_businesses" type="number" min={1} className="input" defaultValue={plan.max_businesses} {...errProps(id("mb"), errors.max_businesses)} />
        </Field>
      </div>

      <Field id={id("feat")} label="Features (one per line)">
        <textarea id={id("feat")} name="features" rows={4} className="input" defaultValue={plan.features.join("\n")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("rm")} label="Razorpay plan ID — monthly" hint="Create it in Razorpay with the price incl. GST." error={errors.razorpay_plan_id_monthly}>
          <input id={id("rm")} name="razorpay_plan_id_monthly" className="input font-mono text-sm" placeholder="plan_..." defaultValue={plan.razorpay_plan_id_monthly ?? ""} {...errProps(id("rm"), errors.razorpay_plan_id_monthly)} />
        </Field>
        <Field id={id("ry")} label="Razorpay plan ID — yearly" error={errors.razorpay_plan_id_yearly}>
          <input id={id("ry")} name="razorpay_plan_id_yearly" className="input font-mono text-sm" placeholder="plan_..." defaultValue={plan.razorpay_plan_id_yearly ?? ""} {...errProps(id("ry"), errors.razorpay_plan_id_yearly)} />
        </Field>
      </div>

      <SaveBar state={state} error={error} />
    </form>
  );
}
