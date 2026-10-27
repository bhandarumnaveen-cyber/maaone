import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison-table";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Pricing } from "@/components/pricing";
import { PageHero } from "@/components/ui";
import { LAUNCH_DATE_LABEL, SALES_OPEN, TRIAL_DAYS } from "@/site.config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Maa One plans from ₹499/month per business. 14-day free trial, yearly plans get 2 months free, cancel anytime. Prices exclude 18% GST.",
  alternates: { canonical: "/pricing" },
};

const notes = [
  "Prices exclude 18% GST. You get a GST invoice from Maa Labs Private Limited for every payment.",
  "WhatsApp message charges from Meta are passed through at cost, with no markup.",
  "Yearly billing = 10 × the monthly price, so you get 2 months free.",
  "Cancel anytime. Your plan stays active until the end of the period you've paid for.",
  "One price per business, not per user.",
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Simple pricing for every stage">
        {SALES_OPEN
          ? `Start with a ${TRIAL_DAYS}-day free trial of everything in Growth.`
          : `Sales open on ${LAUNCH_DATE_LABEL} with a ${TRIAL_DAYS}-day free trial. Join the waitlist to be first in line.`}
      </PageHero>

      <section className="section">
        <div className="container-page">
          <Pricing />
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
            <ComparisonTable />
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
