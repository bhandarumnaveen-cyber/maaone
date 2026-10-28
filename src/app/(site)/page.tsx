import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  FileText,
  IndianRupee,
  Building2,
  Clock,
  Globe,
  Inbox,
  Languages,
  MessageCircle,
  PhoneMissed,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UserX,
} from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { FinalCta } from "@/components/final-cta";
import { JsonLd } from "@/components/json-ld";
import { LaunchStrip } from "@/components/launch-strip";
import { AppImage, type AppImageName } from "@/components/app-image";
import { LazyAiDemo, LazyLossCalculator, LazyProductTour } from "@/components/lazy-widgets";
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

const highlights = [
  { icon: Sparkles, label: "AI replies in Hindi & Punjabi", tone: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200" },
  { icon: FileText, label: "GST invoices", tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200" },
  { icon: IndianRupee, label: "UPI payments", tone: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-200" },
  { icon: WhatsAppIcon, label: "WhatsApp inbox", tone: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200" },
];

const screens: { name: AppImageName; title: string; version: string; body: string }[] = [
  { name: "phone-inbox", title: "One inbox", version: "v1", body: "WhatsApp and website leads, marked hot, warm or cold." },
  { name: "phone-ai-draft", title: "AI reply drafts", version: "v1", body: "A reply in your customer's language. Tap send or edit." },
  { name: "phone-invoice", title: "GST invoices", version: "v2", body: "Send on WhatsApp with a UPI payment link." },
  { name: "phone-technician", title: "Technician app", version: "v3", body: "Jobs, checklists, photos and customer signatures." },
];

const reasons = [
  { icon: MessageCircle, title: "WhatsApp-first", body: "Built around how Indian customers actually reach you — on WhatsApp." },
  { icon: Languages, title: "AI in Indian languages", body: "Replies in Hindi, Punjabi, English and Hinglish that sound like you." },
  { icon: BadgeIndianRupee, title: "GST and UPI ready", body: "GST invoices and UPI payment links built in, not bolted on." },
  { icon: ShieldCheck, title: "Made in India", body: "Designed for Indian service businesses, with support on WhatsApp." },
  { icon: Building2, title: "One price per business", body: "Pay per business, not per user. Add your team without surprise bills." },
];

export const metadata = {
  alternates: { canonical: "/", languages: { "en-IN": "/", "hi-IN": "/hi" } },
};

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
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f6f4ff_0%,#eef0ff_45%,#fff6ea_100%)] dark:bg-[linear-gradient(135deg,#0d0c1d_0%,#141235_55%,#1d1408_100%)]">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:pt-20 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-ink backdrop-blur dark:border-white/10 dark:bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Business Growth Platform for Indian service businesses
            </p>
            <h1 className="mt-6 font-extrabold tracking-tight">
              <span className="block text-2xl text-ink sm:text-3xl">Maa One —</span>
              <span className="mt-1 block text-[2.6rem] leading-[1.05] text-[#26207a] sm:text-6xl sm:whitespace-nowrap lg:text-[3.4rem] xl:text-[4rem] dark:text-indigo-200">
                Poora business,
              </span>
              <span className="relative inline-block text-[2.6rem] leading-[1.1] sm:text-6xl lg:text-[3.4rem] xl:text-[4rem]">
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-orange-400">
                  ek app mein.
                </span>
                <svg viewBox="0 0 300 20" className="absolute -bottom-3 left-[8%] h-4 w-[85%]" aria-hidden="true" preserveAspectRatio="none">
                  <path d="M3 15 Q150 -2 297 11" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted lg:max-w-[30rem]">
              Every lead from your website and WhatsApp in one inbox. AI drafts the reply in Hindi,
              Punjabi or English. You approve and win the customer.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Highlights">
              {highlights.map((h) => (
                <li key={h.label} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${h.tone}`}>
                  <h.icon className="h-4 w-4" aria-hidden="true" />
                  {h.label}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.href} size="lg" className="shadow-lg shadow-indigo-600/25">
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg">
                <PlayCircle className="h-5 w-5 text-brand-ink" aria-hidden="true" /> Watch the demo
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              {settings.salesOpen
                ? `${settings.trialDays}-day free trial · Cancel anytime`
                : `No payment needed · ${settings.trialDays}-day free trial at launch`}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] pb-6 lg:pb-0">
            <AppImage
              name="laptop-crm"
              sizes="(min-width: 1024px) 640px, (min-width: 640px) 90vw, calc(100vw - 32px)"
              className="relative w-full drop-shadow-2xl"
            />
            <AppImage
              name="phone-inbox"
              sizes="(min-width: 1024px) 210px, 31vw"
              className="absolute -bottom-2 -left-2 w-[31%] drop-shadow-2xl sm:-left-6 lg:-bottom-10 lg:-left-12"
            />
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
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="card reveal p-6 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-ink">Leads come from 4 places</h3>
              <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
                {sources.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-sm font-medium text-ink">
                    <s.icon className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card reveal p-6">
              <Clock className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-ink">Replies are late</h3>
              <p className="mt-2 text-muted">
                You are on a job, with a customer, or asleep. The enquiry waits for hours, and
                writing a good reply in the customer&rsquo;s language takes time you don&rsquo;t have.
              </p>
            </div>
            <div className="card reveal p-6">
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

      {/* Product demo */}
      <section
        id="demo"
        aria-labelledby="tour-title"
        className="relative scroll-mt-16 overflow-hidden bg-[linear-gradient(160deg,#1e1b4b_0%,#2a2580_55%,#3730a3_100%)] py-16 text-white sm:py-24"
      >
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" aria-hidden="true" />
        <div className="container-page relative">
          <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
            <p className="text-sm font-semibold tracking-wide text-amber-300 uppercase">Product demo · 25 seconds</p>
            <h2 id="tour-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From WhatsApp enquiry to paid invoice
            </h2>
            <p className="mt-4 text-lg text-indigo-100">Watch one real-life lead go through Maa One — the way it will work on your phone.</p>
          </div>
          <LazyProductTour />
        </div>
      </section>

      {/* Cost of slow replies */}
      <section className="section" aria-labelledby="calc-title">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow">Do the maths</p>
            <h2 id="calc-title" className="h2 mt-2">
              How much are slow replies costing you?
            </h2>
          </div>
          <LazyLossCalculator planPrice={(plans.find((p) => p.code === "growth") ?? plans[0]).inrMonthly} />
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="section border-y border-line bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Three steps to never miss a customer" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="reveal relative rounded-xl border border-line bg-bg p-6 transition-shadow hover:shadow-lg hover:shadow-indigo-900/5">
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

      {/* See it in action */}
      <section id="see-it" className="relative overflow-hidden bg-[linear-gradient(160deg,#1e1b4b_0%,#2a2580_55%,#3730a3_100%)] py-16 text-white sm:py-24">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
        <div className="container-page relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-amber-300 uppercase">See it in action</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your whole business, in your pocket</h2>
            <p className="mt-4 text-lg text-indigo-100">
              From the first WhatsApp message to the paid invoice — every step in one app.
            </p>
          </div>
          <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {screens.map((sc) => (
              <li key={sc.name} className="w-[68%] shrink-0 snap-center sm:w-[42%] lg:w-auto">
                <div className="flex h-[440px] items-end justify-center sm:h-[480px] xl:h-[520px]">
                  <AppImage name={sc.name} sizes="(min-width: 1280px) 280px, (min-width: 640px) 260px, 240px" className="h-full w-auto max-w-full object-contain drop-shadow-2xl" />
                </div>
                <div className="mt-5 text-center">
                  <p className="flex items-center justify-center gap-2 font-semibold">
                    {sc.title}
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-amber-200">{sc.version}</span>
                  </p>
                  <p className="mt-1 text-sm text-indigo-100">{sc.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Try the AI reply */}
      <section className="section" aria-labelledby="demo-title">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow">Try it</p>
            <h2 id="demo-title" className="h2 mt-2">
              See the AI reply in your customer&rsquo;s language
            </h2>
            <p className="lead mt-4">Pick an enquiry and a language. Maa One drafts the reply — you just approve.</p>
          </div>
          <LazyAiDemo />
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
          <ul className="mt-12 grid gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-5">
            {reasons.map((r, i) => (
              <li
                key={r.title}
                className={`reveal rounded-xl border border-line bg-bg p-5 transition-shadow hover:shadow-lg hover:shadow-indigo-900/5 lg:col-span-1 ${i < 3 ? "sm:col-span-2" : "sm:col-span-3"}`}
              >
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
