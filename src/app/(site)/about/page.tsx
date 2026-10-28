import type { Metadata } from "next";
import { ArrowUpRight, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { MaaLabsLogo, NaveenCodesLogo } from "@/components/logos";
import { FinalCta } from "@/components/final-cta";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Maa One exists, who builds it, and the two brands behind it: Maa Labs Private Limited and NaveenCodes.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const cfg = await getSettings();
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,var(--brand-soft),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="container-page relative py-14 sm:py-20">
          <p className="text-sm font-medium text-muted">{site.creditLine}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Make world-class business software affordable for every Indian small business.
          </h1>
          <p className="lead mt-4 max-w-2xl">That is our mission, and Maa One is how we do it.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="h2">Why Maa One exists</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
              <p>
                India runs on small service businesses — the AC technician, the salon, the coaching
                centre, the clinic, the interior designer. They win customers on WhatsApp, keep
                accounts in a register, and lose leads simply because nobody replied in time.
              </p>
              <p>
                The software that big companies use costs too much, charges per user, speaks only
                English, and ignores GST and UPI. So most small businesses go without.
              </p>
              <p>
                Maa One is built the other way round: WhatsApp-first, AI that replies in Hindi,
                Punjabi and English, GST and UPI built in, and one fair price per business. One app
                for the whole business — <em>poora business, ek app mein</em>.
              </p>
            </div>
          </div>

          <figure className="card p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div
                role="img"
                aria-label={`Photo of ${site.founder} (placeholder)`}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-500 text-2xl font-bold text-white"
              >
                NG
              </div>
              <figcaption>
                <p className="text-lg font-semibold text-ink">{site.founder}</p>
                <p className="text-sm text-muted">
                  {site.founderTitle}, {site.company}
                </p>
              </figcaption>
            </div>
            <blockquote className="mt-6 space-y-4 border-l-4 border-accent pl-4 leading-relaxed text-ink">
              <p>
                &ldquo;I have watched good businesses lose customers for one simple reason — the
                reply came too late. Maa One is my answer to that. It is the tool I wish every
                small business owner I know had: simple enough to use between jobs, smart enough
                to write the reply for you, and priced so that nobody is left out.
              </p>
              <p>
                We are building it in the open, one module at a time, with the businesses who use
                it. If you have an idea, write to me — I read every message.&rdquo;
              </p>
            </blockquote>
          </figure>
        </div>
      </section>

      <section className="section border-y border-line bg-surface" aria-labelledby="brands-title">
        <div className="container-page">
          <h2 id="brands-title" className="h2 text-center">
            The two brands behind Maa One
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-xl border border-line bg-bg p-6 sm:p-8">
              <MaaLabsLogo className="text-2xl" />
              <p className="mt-1 text-sm font-medium text-muted">{site.company}</p>
              <p className="mt-4 leading-relaxed text-ink">
                The company that owns and runs Maa One. Maa Labs bills customers, issues GST
                invoices, provides support and is responsible for your data.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <a href={`mailto:${cfg.supportEmail}`} className="inline-flex items-center gap-2 font-medium text-brand-ink hover:underline">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {cfg.supportEmail}
                  </a>
                </li>
                <li>
                  <a
                    href={cfg.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-brand-ink hover:underline"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp {cfg.whatsappDisplay}
                  </a>
                </li>
              </ul>
            </article>
            <article className="rounded-xl border border-line bg-bg p-6 sm:p-8">
              <NaveenCodesLogo className="text-2xl" />
              <p className="mt-1 text-sm font-medium text-muted">Developer brand of {site.founder}</p>
              <p className="mt-4 leading-relaxed text-ink">
                {site.founder}&rsquo;s developer brand, which designs and builds Maa One — the app,
                the AI and this website.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <a
                    href={site.developer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-brand-ink hover:underline"
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    naveencodes.com
                  </a>
                </li>
                <li>
                  <a href={`mailto:${cfg.naveencodesEmail}`} className="inline-flex items-center gap-2 font-medium text-brand-ink hover:underline">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {cfg.naveencodesEmail}
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="company-title">
        <div className="container-page max-w-3xl">
          <h2 id="company-title" className="h2">
            Company details
          </h2>
          <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
            {[
              ["Company", site.company],
              ["Product", site.name],
              [site.founderTitle, site.founder],
              ["Support", cfg.supportEmail],
              ["WhatsApp", cfg.whatsappDisplay],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                <dt className="text-sm font-medium text-muted">{k}</dt>
                <dd className="font-medium text-ink sm:col-span-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
