import type { Metadata } from "next";
import { CalendarCheck, Gift, MessageCircle } from "lucide-react";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { getPlans, getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Join the waitlist",
    description: `Join the Maa One waitlist. Pilot in December 2026, launch on ${s.launchDateLabel}.`,
    alternates: { canonical: "/waitlist" },
  };
}

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ref?: string; utm_source?: string }>;
}) {
  const [{ plan, ref, utm_source }, s, plans] = await Promise.all([searchParams, getSettings(), getPlans()]);
  const defaultPlan = plans.some((p) => p.code === plan) ? plan! : "";
  const perks = [
    { icon: CalendarCheck, text: "A chance to join the pilot in December 2026" },
    { icon: Gift, text: `A ${s.trialDays}-day free trial when we launch on ${s.launchDateLabel}` },
    { icon: MessageCircle, text: "Help shape what we build next" },
  ];

  return (
    <section className="section">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">Waitlist</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Be first in line for Maa One</h1>
          <p className="lead mt-4">It takes 30 seconds. No payment needed.</p>
          <ul className="mt-8 space-y-4">
            {perks.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="pt-1.5 text-ink">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <WaitlistForm plans={plans} defaultPlan={defaultPlan} referral={ref} utm={utm_source} />
      </div>
    </section>
  );
}
