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
            <article className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-[linear-gradient(160deg,#fffbeb_0%,#ffffff_55%)] p-6 shadow-sm sm:p-8 dark:border-amber-400/20 dark:bg-[linear-gradient(160deg,#2a1f08_0%,#14141f_60%)]">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-red-600" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.14em] text-amber-700 uppercase dark:text-amber-300">The company</p>
              <MaaLabsLogo className="mt-4 text-2xl" />
              <p className="mt-2 text-sm font-medium text-muted">{site.company}</p>
              <p className="mt-4 leading-relaxed text-ink">
                The company that owns and runs Maa One. Maa Labs bills customers, issues GST
                invoices, provides support and is responsible for your data.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <a href={`mailto:${cfg.supportEmail}`} className="inline-flex items-center gap-2 font-semibold text-amber-800 hover:underline dark:text-amber-300">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {cfg.supportEmail}
                  </a>
                </li>
                <li>
                  <a
                    href={cfg.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-amber-800 hover:underline dark:text-amber-300"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp {cfg.whatsappDisplay}
                  </a>
                </li>
              </ul>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-[linear-gradient(160deg,#fff7ed_0%,#ffffff_55%)] p-6 shadow-sm sm:p-8 dark:border-orange-400/20 dark:bg-[linear-gradient(160deg,#2a1608_0%,#14141f_60%)]">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-indigo-500" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.14em] text-orange-700 uppercase dark:text-orange-300">The builders</p>
              <NaveenCodesLogo className="mt-4 text-2xl" />
              <p className="mt-2 text-sm font-medium text-muted">Developer brand of {site.founder}</p>
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
                    className="inline-flex items-center gap-2 font-semibold text-orange-700 hover:underline dark:text-orange-300"
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    naveencodes.com
                  </a>
                </li>
                <li>
                  <a href={`mailto:${cfg.naveencodesEmail}`} className="inline-flex items-center gap-2 font-semibold text-orange-700 hover:underline dark:text-orange-300">
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
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 id="company-title" className="h2">
              Company details
            </h2>
            <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface shadow-sm">
              {[
                ["Company", site.company],
                ["Product", site.name],
                [site.founderTitle, site.founder],
                ["Built by", "NaveenCodes"],
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
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/maaone-maalabs-naveencodes-960.webp"
              srcSet="/brand/maaone-maalabs-naveencodes-640.webp 640w, /brand/maaone-maalabs-naveencodes-960.webp 960w, /brand/maaone-maalabs-naveencodes-1440.webp 1440w"
              sizes="(min-width: 1024px) 560px, calc(100vw - 32px)"
              width={1440}
              height={480}
              loading="lazy"
              decoding="async"
              alt="Maa One — Business Growth Platform, by Maa Labs and NaveenCodes"
              className="w-full rounded-2xl shadow-2xl shadow-indigo-900/25 ring-1 ring-black/5"
            />
            <figcaption className="mt-3 text-center text-sm text-muted">
              Maa One by Maa Labs · designed and built by NaveenCodes
            </figcaption>
          </figure>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
