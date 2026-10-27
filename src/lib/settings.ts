import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { fallbackPlans, fallbackSettings } from "@/site.config";
import type { Plan, Settings } from "@/lib/types";

const REVALIDATE_SECONDS = 300;

/** "+918053385815" → "+91 80533 85815" */
export function formatIndianPhone(e164: string) {
  const d = e164.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : e164;
}

function buildSettings(raw: Record<string, unknown>): Settings {
  const str = (k: string, d: string) => (typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : d);
  const num = (k: string, d: number) => (Number.isFinite(Number(raw[k])) && raw[k] !== null ? Number(raw[k]) : d);

  const launchDay = str("launch_date", fallbackSettings.launchDate);
  const whatsapp = str("whatsapp", fallbackSettings.whatsapp);
  const instagram = str("instagram", fallbackSettings.instagram).replace(/^@/, "");
  return {
    salesOpen: raw.sales_open === undefined ? fallbackSettings.salesOpen : raw.sales_open === true,
    launchDate: launchDay,
    launchDateIso: `${launchDay}T00:00:00+05:30`,
    launchDateLabel: new Date(`${launchDay}T00:00:00+05:30`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    trialDays: num("trial_days", fallbackSettings.trialDays),
    gstRate: num("gst_rate", fallbackSettings.gstRate),
    supportEmail: str("support_email", fallbackSettings.supportEmail),
    naveencodesEmail: str("naveencodes_email", fallbackSettings.naveencodesEmail),
    whatsappDisplay: formatIndianPhone(whatsapp),
    whatsappLink: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    instagramHandle: `@${instagram}`,
    instagramUrl: `https://instagram.com/${instagram}`,
    appUrl: str("app_url", fallbackSettings.appUrl),
  };
}

const loadSettings = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    if (!supabaseConfigured) return {};
    const { data, error } = await createAnonClient().from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
  ["site_settings"],
  { revalidate: REVALIDATE_SECONDS, tags: ["site_settings"] },
);

/** site_settings from Supabase, falling back to site.config.ts if the database is unreachable. */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    return buildSettings(await loadSettings());
  } catch (e) {
    console.error("[site_settings]", e);
    return buildSettings({});
  }
});

type PlanRow = {
  code: string;
  name: string;
  tagline: string | null;
  price_inr_monthly: number;
  price_inr_yearly: number;
  price_usd_monthly: number;
  price_usd_yearly: number;
  max_users: number | null;
  max_businesses: number;
  features: unknown;
  is_popular: boolean;
};

const loadPlans = unstable_cache(
  async (): Promise<PlanRow[] | null> => {
    if (!supabaseConfigured) return null;
    const { data, error } = await createAnonClient()
      .from("plans")
      .select(
        "code, name, tagline, price_inr_monthly, price_inr_yearly, price_usd_monthly, price_usd_yearly, max_users, max_businesses, features, is_popular",
      )
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as PlanRow[];
  },
  ["plans"],
  { revalidate: REVALIDATE_SECONDS, tags: ["plans"] },
);

/** Active paid plans from Supabase (amounts in paise/cents), falling back to site.config.ts. */
export const getPlans = cache(async (): Promise<Plan[]> => {
  try {
    const rows = await loadPlans();
    if (!rows?.length) return fallbackPlans;
    return rows.map((r) => ({
      code: r.code,
      name: r.name,
      tagline: r.tagline ?? "",
      inrMonthly: r.price_inr_monthly,
      inrYearly: r.price_inr_yearly,
      usdMonthly: r.price_usd_monthly,
      usdYearly: r.price_usd_yearly,
      maxUsers: r.max_users,
      maxBusinesses: r.max_businesses,
      features: Array.isArray(r.features) ? r.features.map(String) : [],
      popular: r.is_popular,
    }));
  } catch (e) {
    console.error("[plans]", e);
    return fallbackPlans;
  }
});
