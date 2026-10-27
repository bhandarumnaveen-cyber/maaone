import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Checkout } from "@/components/checkout";
import type { Billing } from "@/components/forms/billing-form";
import { getPlans, getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Start your free trial",
  robots: { index: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; period?: string }>;
}) {
  const [{ plan, period }, settings, plans] = await Promise.all([searchParams, getSettings(), getPlans()]);
  if (!settings.salesOpen) redirect(`/waitlist${plan ? `?plan=${encodeURIComponent(plan)}` : ""}`);

  const planCode = plans.some((p) => p.code === plan) ? plan! : (plans.find((p) => p.popular) ?? plans[0]).code;
  const billingPeriod = period === "yearly" ? "yearly" : "monthly";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/signup?plan=${planCode}&period=${billingPeriod}`)}`);

  const [{ data: billing }, { data: subs }] = await Promise.all([
    supabase
      .from("billing_details")
      .select("business_name, gstin, address_line1, address_line2, city, state, pincode")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("subscriptions").select("status, trial_ends_at").eq("user_id", user.id),
  ]);
  if ((subs ?? []).some((s) => ["authenticated", "active", "pending", "halted", "paused"].includes(s.status))) {
    redirect("/account");
  }
  const trialEligible = !(subs ?? []).some((s) => s.trial_ends_at && s.status !== "created");

  return (
    <section className="container-page py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {trialEligible ? `Start your ${settings.trialDays}-day free trial` : "Choose your plan"}
      </h1>
      <p className="mt-2 mb-8 text-muted">Logged in as {user.email ?? user.phone}</p>
      <Checkout
        plans={plans}
        initialPlan={planCode}
        initialPeriod={billingPeriod}
        billing={billing as Billing | null}
        settings={settings}
        trialEligible={trialEligible}
      />
    </section>
  );
}
