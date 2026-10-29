import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison-table";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Pricing } from "@/components/pricing";
import { PageHero } from "@/components/ui";
import { getPlans, getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Maa One plans from ₹499/month per business. 14-day free trial, yearly plans get 2 months free, cancel anytime. Prices exclude 18% GST.",
  alternates: { canonical: "/pricing" },
};

const notes = [
  "Prices exclude GST (currently 18%). You get a GST invoice from Maa Labs Private Limited for every payment.",
  "WhatsApp message charges from Meta are passed through at cost, with no markup.",
  "Yearly plans cost 10 × the monthly price, so you get 2 months free.",
  "Cancel anytime. Your plan stays active until the end of the period you've paid for.",
  "One price per business, not per user.",
];

export default async function PricingPage() {
  const [s, plans] = await Promise.all([getSettings(), getPlans()]);
  return (
    <>
      <PageHero eyebrow="Pricing" title="Simple pricing for every stage">
        {s.salesOpen
          ? `Start with a ${s.trialDays}-day free trial of everything in Growth.`
          : `Sales open in ${s.launchYear} with a ${s.trialDays}-day free trial. Join the waitlist to be first in line.`}
      </PageHero>

      <section className="section">
        <div className="container-page">
          <h2 className="sr-only">Plans</h2>
          <Pricing plans={plans} />
          <ul className="mx-auto mt-10 max-w-3xl space-y-2 text-sm text-muted">
            {notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-y border-line bg-surface" aria-labelledby="compare-title">
        <div className="container-page">
          <h2 id="compare-title" className="h2 text-center">
            Compare plans
          </h2>
          <p className="lead mt-3 text-center">
            Modules join each plan as they release — see the{" "}
            <a href="/roadmap" className="font-medium text-brand-ink underline underline-offset-2">
              roadmap
            </a>
            .
          </p>
          <div className="mt-10">
            <ComparisonTable plans={plans} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pricing-faq">
        <div className="container-page">
          <h2 id="pricing-faq" className="h2 mb-10 text-center">
            Questions
          </h2>
          <Faq />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
