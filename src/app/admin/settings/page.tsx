import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { razorpayConfigured } from "@/lib/razorpay";
import { fallbackSettings } from "@/site.config";
import { PageHeader, Panel } from "@/components/dashboard-ui";
import { PlanForm, SiteSettingsForm, type PlanValues, type SiteSettingsValues } from "@/components/admin/settings-forms";

export const metadata = { title: "Settings" };

export default async function AdminSettings() {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return null;

  // Read fresh from the database (not the 5-minute cache), including inactive plans.
  const [{ data: rows, error: settingsError }, { data: plans, error: plansError }, live] = await Promise.all([
    auth.supabase.from("site_settings").select("key, value"),
    auth.supabase
      .from("plans")
      .select("code, name, tagline, price_inr_monthly, price_inr_yearly, price_usd_monthly, price_usd_yearly, max_users, max_businesses, features, is_popular, is_active, razorpay_plan_id_monthly, razorpay_plan_id_yearly")
      .order("sort_order"),
    getSettings(),
  ]);
  const raw = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const get = <T,>(k: string, d: T): T => (raw[k] ?? d) as T;

  const initial: SiteSettingsValues = {
    sales_open: raw.sales_open === true,
    launch_date: String(get("launch_date", fallbackSettings.launchDate)),
    trial_days: Number(get("trial_days", fallbackSettings.trialDays)),
    gst_rate: Number(get("gst_rate", fallbackSettings.gstRate)),
    company_state: String(get("company_state", "Punjab")),
    support_email: String(get("support_email", fallbackSettings.supportEmail)),
    naveencodes_email: String(get("naveencodes_email", fallbackSettings.naveencodesEmail)),
    whatsapp: String(get("whatsapp", fallbackSettings.whatsapp)),
    instagram: String(get("instagram", fallbackSettings.instagram)),
    app_url: String(get("app_url", fallbackSettings.appUrl)),
  };

  return (
    <>
      <PageHeader title="Settings" description="Changes go live on the website within seconds — no code or SQL needed." />
      {(settingsError || plansError) && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Couldn&rsquo;t load settings: {(settingsError ?? plansError)?.message}
        </p>
      )}
      <div className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Website settings" description="Sales, launch date, trial, GST and contact details." className="h-fit">
          <SiteSettingsForm initial={initial} razorpayReady={razorpayConfigured()} />
        </Panel>
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-ink">Plans</h2>
            <p className="mt-0.5 text-sm text-muted">Prices exclude GST. Yearly = 10 × monthly gives &ldquo;2 months free&rdquo;.</p>
          </div>
          {(plans ?? []).map((p) => (
            <PlanForm key={p.code} plan={{ ...(p as PlanValues), features: Array.isArray(p.features) ? p.features.map(String) : [] }} gstRate={live.gstRate} />
          ))}
        </div>
      </div>
    </>
  );
}
