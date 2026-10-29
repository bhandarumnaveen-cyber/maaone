import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { FeatureRequestForm } from "@/components/forms/feature-request-form";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { PageHero } from "@/components/ui";
import { launchSteps } from "@/site.config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Roadmap — Kab kya aayega",
  description:
    "What ships when: the Maa One Inbox at launch in 2027, then the mobile app, bookings and payments, field work and growth tools, and more.",
  alternates: { canonical: "/roadmap" },
};

export default async function RoadmapPage() {
  const steps = launchSteps(await getSettings());
  return (
    <>
      <PageHero eyebrow="Roadmap" title="Kab kya aayega">
        What ships when, and where we are right now. Dates are our best plan today; we update this
        page as things change.
      </PageHero>

      <section className="section pb-0">
        <div className="container-page">
          <div className="rounded-2xl border-2 border-accent/60 bg-accent-soft/40 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink">Start here</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-4">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className={clsx(
                    "rounded-xl border bg-surface p-4",
                    s.current ? "border-brand-ink ring-2 ring-brand-ink/30" : "border-line",
                  )}
                  aria-current={s.current ? "step" : undefined}
                >
                  <span className="text-xs font-bold tracking-wide text-accent-ink uppercase">Step {i + 1}</span>
                  <p className="mt-1 font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">{s.when}</p>
                  {s.current && (
                    <Link href="/waitlist" className="mt-3 inline-block text-sm font-semibold text-brand-ink hover:underline">
                      Join now →
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="versions-title">
        <div className="container-page grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 id="versions-title" className="h2 mb-8">
              Versions
            </h2>
            <RoadmapTimeline />
          </div>
          <aside aria-labelledby="request-title" className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="request-title" className="text-2xl font-bold text-ink">
              Request a feature
            </h2>
            <p className="mt-2 mb-5 text-muted">
              Something your business needs that isn&rsquo;t on the list? Tell us.
            </p>
            <FeatureRequestForm />
          </aside>
        </div>
      </section>
    </>
  );
}
