import type { Metadata } from "next";
import { ArrowRight, BadgeIndianRupee, Building2, Clock, Inbox, Languages, MessageCircle, Send, ShieldCheck, Sparkles, UserX } from "lucide-react";
import { LazyAiDemo } from "@/components/lazy-widgets";
import { AppImage } from "@/components/app-image";
import { ButtonLink } from "@/components/ui";
import { getPlans, getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: "Maa One — पूरा बिज़नेस, एक ऐप में" },
  description:
    "वेबसाइट और WhatsApp की हर इन्क्वायरी एक इनबॉक्स में। AI हिंदी, पंजाबी या अंग्रेज़ी में जवाब तैयार करता है। आप मंज़ूर करें और ग्राहक जीतें।",
  alternates: { canonical: "/hi", languages: { "en-IN": "/", "hi-IN": "/hi" } },
  openGraph: { locale: "hi_IN" },
};

const problems = [
  { icon: Inbox, title: "4 जगह से इन्क्वायरी", body: "वेबसाइट फ़ॉर्म, WhatsApp, Instagram और मिस्ड कॉल — सब अलग-अलग जगह, कोई एक लिस्ट नहीं।" },
  { icon: Clock, title: "जवाब में देरी", body: "आप काम पर हैं, ग्राहक के साथ हैं या सो रहे हैं — इन्क्वायरी घंटों इंतज़ार करती है।" },
  { icon: UserX, title: "ग्राहक हाथ से निकल जाता है", body: "जो पहले जवाब देता है, अक्सर वही काम पाता है। देर से गया हर जवाब किसी और का ग्राहक बन जाता है।" },
];

const steps = [
  { icon: Inbox, title: "अपनी वेबसाइट और WhatsApp जोड़ें", body: "हमारा विजेट लगाइए या मौजूदा फ़ॉर्म जोड़िए, और अपना WhatsApp बिज़नेस नंबर कनेक्ट कीजिए। लगभग 10 मिनट का काम।" },
  { icon: Sparkles, title: "AI हर इन्क्वायरी छाँटता है और जवाब लिखता है", body: "Maa One हर लीड को हॉट, वॉर्म या कोल्ड बताता है और हिंदी, पंजाबी या अंग्रेज़ी में जवाब तैयार करता है।" },
  { icon: Send, title: "आप मंज़ूर करें, फ़ॉलो-अप करें और ग्राहक जीतें", body: "एक टैप में जवाब भेजिए। Maa One फ़ॉलो-अप की याद दिलाता है, ताकि कोई ग्राहक न छूटे।" },
];

export default async function HindiHome() {
  const [settings, plans] = await Promise.all([getSettings(), getPlans()]);
  const launch = new Date(settings.launchDateIso).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const cheapest = Math.min(...plans.map((p) => p.inrMonthly));
  const cta = settings.salesOpen
    ? { label: `${settings.trialDays} दिन का फ़्री ट्रायल शुरू करें`, href: "/signup?plan=growth" }
    : { label: "वेटलिस्ट से जुड़ें", href: "/waitlist?plan=growth" };

  const reasons = [
    { icon: MessageCircle, title: "WhatsApp पर आधारित", body: "जहाँ आपके ग्राहक हैं, वहीं काम करता है।" },
    { icon: Languages, title: "भारतीय भाषाओं में AI", body: "हिंदी, पंजाबी, अंग्रेज़ी और हिंग्लिश में जवाब।" },
    { icon: BadgeIndianRupee, title: "GST और UPI तैयार", body: "GST बिल और UPI पेमेंट लिंक साथ में।" },
    { icon: ShieldCheck, title: "भारत में बना", body: "भारतीय सर्विस बिज़नेस के लिए, WhatsApp पर सपोर्ट के साथ।" },
    { icon: Building2, title: "प्रति बिज़नेस एक कीमत", body: `प्रति यूज़र नहीं, पूरे बिज़नेस के लिए एक दाम — ${formatMoney(cheapest, "INR")}/महीने से शुरू।` },
  ];

  return (
    <div lang="hi">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f6f4ff_0%,#eef0ff_45%,#fff6ea_100%)] dark:bg-[linear-gradient(135deg,#0d0c1d_0%,#141235_55%,#1d1408_100%)]">
        <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-3 py-1 text-sm font-semibold text-brand-ink dark:border-white/10 dark:bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              भारत के सर्विस बिज़नेस के लिए
            </p>
            <h1 className="mt-6 font-extrabold tracking-tight">
              <span className="block text-2xl text-ink sm:text-3xl">Maa One —</span>
              <span className="mt-2 block text-[2.4rem] leading-[1.2] text-[#26207a] sm:text-6xl dark:text-indigo-200">पूरा बिज़नेस,</span>
              <span className="block bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-[2.4rem] leading-[1.3] text-transparent sm:text-6xl dark:from-amber-300 dark:to-orange-400">
                एक ऐप में।
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              वेबसाइट और WhatsApp से आने वाली हर इन्क्वायरी एक ही इनबॉक्स में। AI आपके ग्राहक की भाषा — हिंदी, पंजाबी या अंग्रेज़ी —
              में जवाब तैयार करता है। आप बस भेजिए और ग्राहक जीतिए।
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.href} size="lg" className="shadow-lg shadow-indigo-600/25">
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg">
                कैसे काम करता है देखें
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              {settings.salesOpen ? "कभी भी कैंसल करें" : `लॉन्च: ${launch} · अभी कोई भुगतान नहीं`}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[600px]">
            <AppImage name="laptop-crm" sizes="(min-width: 1024px) 560px, 92vw" className="w-full drop-shadow-2xl" />
            <AppImage name="phone-ai-draft" sizes="(min-width: 1024px) 190px, 30vw" className="absolute -bottom-4 -left-2 w-[30%] drop-shadow-2xl sm:-left-6" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="h2 text-center">इन्क्वायरी हर जगह से आती हैं, जवाब देर से जाता है</h2>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {problems.map((p) => (
              <li key={p.title} className="card p-6 shadow-sm">
                <p.icon className="h-8 w-8 text-accent-ink" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-y border-line bg-surface">
        <div className="container-page">
          <h2 className="h2 text-center">3 आसान कदम</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-line bg-bg p-6">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-brand-ink/10" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="demo" className="section">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h2">देखिए AI आपके ग्राहक की भाषा में कैसे जवाब देता है</h2>
            <p className="lead mt-4">कोई इन्क्वायरी और भाषा चुनिए — Maa One जवाब तैयार करता है, आप बस मंज़ूर करते हैं।</p>
          </div>
          <LazyAiDemo />
        </div>
      </section>

      <section className="section border-y border-line bg-surface">
        <div className="container-page">
          <h2 className="h2 text-center">Maa One क्यों?</h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {reasons.map((r) => (
              <li key={r.title} className="rounded-xl border border-line bg-bg p-5">
                <r.icon className="h-6 w-6 text-brand-ink" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">पूरा बिज़नेस, एक ऐप में।</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-indigo-100">
              {settings.salesOpen ? `${settings.trialDays} दिन मुफ़्त आज़माइए।` : `${launch} को लॉन्च। आज ही वेटलिस्ट से जुड़ें।`}
            </p>
            <ButtonLink href={cta.href} variant="accent" size="lg" className="mt-8">
              {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
