import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Clock,
  Globe,
  Inbox,
  Languages,
  MessageCircle,
  PhoneMissed,
  Send,
  ShieldCheck,
  Sparkles,
  UserX,
} from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { FinalCta } from "@/components/final-cta";
import { JsonLd } from "@/components/json-ld";
import { LaunchStrip } from "@/components/launch-strip";
import { LaptopDashboardMockup, PhoneInboxMockup } from "@/components/mockups";
import { FeatureBlocks } from "@/components/feature-blocks";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { PricingPreview } from "@/components/pricing-preview";
import { Faq } from "@/components/faq";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { getPlans, getSettings } from "@/lib/settings";
import { primaryCta } from "@/lib/cta";
import { site } from "@/site.config";

const sources = [
  { icon: Globe, label: "Website forms" },
  { icon: WhatsAppIcon, label: "WhatsApp chats" },
  { icon: InstagramIcon, label: "Instagram DMs" },
  { icon: PhoneMissed, label: "Missed calls" },
];

const steps = [
  {
    icon: Inbox,
    title: "Connect your website and WhatsApp",
    body: "Add our widget or link your existing forms, and connect your WhatsApp business number. Takes about 10 minutes.",
  },
  {
    icon: Sparkles,
    title: "AI sorts every lead and drafts the reply",
    body: "Maa One scores each enquiry — hot, warm or cold — and writes a reply in Hindi, Punjabi or English.",
  },
  {
    icon: Send,
    title: "You approve, follow up and win",
    body: "Tap approve to send. Maa One reminds you to follow up so no customer slips away.",
  },
];

const reasons = [
  { icon: MessageCircle, title: "WhatsApp-first", body: "Built around how Indian customers actually reach you — on WhatsApp." },
  { icon: Languages, title: "AI in Indian languages", body: "Replies in Hindi, Punjabi, English and Hinglish that sound like you." },
  { icon: BadgeIndianRupee, title: "GST and UPI ready", body: "GST invoices and UPI payment links built in, not bolted on." },
  { icon: ShieldCheck, title: "Made in India", body: "Designed for Indian service businesses, with support on WhatsApp." },
  { icon: Building2, title: "One price per business", body: "Pay per business, not per user. Add your team without surprise bills." },
];

/** Refresh the waitlist count every 5 minutes. */
export const revalidate = 300;

export default async function Home() {
  const [settings, plans] = await Promise.all([getSettings(), getPlans()]);
  const cta = primaryCta(settings);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: site.name,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web, Android, iOS",
          description: site.description,
          url: site.url,
          publisher: { "@type": "Organization", name: site.company, url: site.url },
          offers: plans.map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: (p.inrMonthly / 100).toFixed(2),
            priceCurrency: "INR",
            category: "subscription",
            availabilityStarts: settings.launchDate,
          })),
        }}
      />
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,var(--brand-soft),transparent),radial-gradient(40%_40%_at_10%_80%,var(--accent-soft),transparent)]"
          aria-hidden="true"
        />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              For Indian service businesses
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Maa One —{" "}
              <span className="text-brand-ink">Poora business,</span>{" "}
              <span className="relative whitespace-nowrap">
                ek app mein.
                <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-accent/60" aria-hidden="true" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Every lead from your website and WhatsApp in one inbox. AI drafts the reply in Hindi,
              Punjabi or English. You approve and win the customer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.href} size="lg">
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              {settings.salesOpen
                ? `${settings.trialDays}-day free trial · Cancel anytime`
                : `No payment needed · ${settings.trialDays}-day free trial at launch`}
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[560px] items-end">
            <LaptopDashboardMockup className="mb-8 min-w-0 flex-1" />
            <PhoneInboxMockup className="relative z-10 -ml-12 w-[196px] shrink-0 sm:-ml-24 sm:w-[220px]" />
          </div>
        </div>
      </section>

      {/* 2. Launch strip */}
      <LaunchStrip />

      {/* 3. Problem */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="The problem" title="Leads come from everywhere. Replies come too late.">
            Your customers reach you in four different places. By the time you reply, they have
            already called someone else.
          </SectionHeading>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className="card p-6">
              <h3 className="font-semibold text-ink">Leads come from 4 places</h3>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {sources.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-sm font-medium text-ink">
                    <s.icon className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <Clock className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-ink">Replies are late</h3>
              <p className="mt-2 text-muted">
                You are on a job, with a customer, or asleep. The enquiry waits for hours, and
                writing a good reply in the customer&rsquo;s language takes time you don&rsquo;t have.
              </p>
            </div>
            <div className="card p-6">
              <UserX className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-ink">Customers are lost</h3>
              <p className="mt-2 text-muted">
                The business that replies first usually wins. Every slow reply is a customer — and
                their referrals — handed to a competitor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="section border-y border-line bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Three steps to never miss a customer" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-line bg-bg p-6">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-brand-ink/10" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Features */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Features" title="One app for the whole business">
            Start with the inbox in v1. A new module arrives every 2–3 months — each one marked
            with when it ships.
          </SectionHeading>
          <div className="mt-12">
            <FeatureBlocks />
          </div>
          <div className="mt-8 text-center">
            <Link href="/features" className="inline-flex items-center gap-1 font-semibold text-brand-ink hover:underline">
              See every feature <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Roadmap preview */}
      <section className="section border-y border-line bg-surface">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading eyebrow="Roadmap" title="Kab kya aayega" align="left">
              We build in the open. Here is what ships when — and where we are right now.
            </SectionHeading>
            <ButtonLink href="/roadmap" variant="secondary" className="mt-6">
              View the full roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <RoadmapTimeline compact />
        </div>
      </section>

      {/* 7. Pricing preview */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Pricing" title="Simple pricing, per business">
            Prices exclude GST. Yearly plans get 2 months free.
          </SectionHeading>
          <div className="mt-10">
            <PricingPreview plans={plans} settings={settings} />
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1 font-semibold text-brand-ink hover:underline">
              Compare plans in detail <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Why Maa One */}
      <section className="section border-y border-line bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="Why Maa One" title="Made for how India does business" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {reasons.map((r) => (
              <li key={r.title} className="rounded-xl border border-line bg-bg p-5">
                <r.icon className="h-6 w-6 text-brand-ink" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="section">
        <div className="container-page">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10">
            <Faq />
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <FinalCta />
    </>
  );
}
