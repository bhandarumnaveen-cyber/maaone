import { ArrowRight } from "lucide-react";
import { ButtonLink } from "./ui";
import { SALES_OPEN, TRIAL_DAYS, primaryCta, site } from "@/site.config";

export function FinalCta() {
  const cta = primaryCta();
  return (
    <section className="pb-16 sm:pb-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {site.tagline}.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-lg text-indigo-100">
            {SALES_OPEN
              ? `Try every feature free for ${TRIAL_DAYS} days. Cancel anytime.`
              : "Be among the first businesses on Maa One. Join the waitlist today."}
          </p>
          <ButtonLink href={cta.href} variant="accent" size="lg" className="relative mt-8">
            {SALES_OPEN ? "Start free trial" : cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
