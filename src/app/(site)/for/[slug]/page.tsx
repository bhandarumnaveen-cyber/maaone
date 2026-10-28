import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { LazyAiDemo } from "@/components/lazy-widgets";
import { AppImage } from "@/components/app-image";
import { FinalCta } from "@/components/final-cta";
import { ButtonLink, ReleaseBadge } from "@/components/ui";
import { demoEnquiries } from "@/data/demo-replies";
import { industries, industryBySlug } from "@/data/industries";
import { primaryCta } from "@/lib/cta";
import { getSettings } from "@/lib/settings";
import { moduleGroups } from "@/site.config";

export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ind = industryBySlug((await params).slug);
  if (!ind) return {};
  return {
    title: ind.metaTitle,
    description: ind.metaDescription,
    alternates: { canonical: `/for/${ind.slug}` },
    openGraph: { title: ind.metaTitle, description: ind.metaDescription },
  };
}

const allModules = moduleGroups.flatMap((g) => g.modules);

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const ind = industryBySlug((await params).slug);
  if (!ind) notFound();
  const settings = await getSettings();
  const cta = primaryCta(settings);
  const demo = demoEnquiries.filter((e) => e.id === ind.demo);
  const modules = ind.modules.map((n) => allModules.find((m) => m.name === n)).filter((m) => m !== undefined);
  const laptop = ind.image === "laptop-crm";

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f6f4ff_0%,#eef0ff_45%,#fff6ea_100%)] dark:bg-[linear-gradient(135deg,#0d0c1d_0%,#141235_55%,#1d1408_100%)]">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Maa One for {ind.name.toLowerCase()}</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#26207a] sm:text-5xl dark:text-indigo-100">{ind.headline}</h1>
            <p className="lead mt-5 max-w-2xl">{ind.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.href} size="lg">
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg">
                Try the AI reply
              </ButtonLink>
            </div>
          </div>
          <AppImage
            name={ind.image}
            sizes={laptop ? "(min-width: 1024px) 480px, 90vw" : "260px"}
            className={laptop ? "mx-auto w-full max-w-lg drop-shadow-2xl" : "mx-auto w-[240px] drop-shadow-2xl sm:w-[260px]"}
          />
        </div>
      </section>

      <section className="section" aria-labelledby="pains-title">
        <div className="container-page">
          <h2 id="pains-title" className="h2 text-center">
            Sound familiar?
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {ind.pains.map((p) => (
              <li key={p.title} className="card p-6 shadow-sm">
                <XCircle className="h-7 w-7 text-rose-500" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demo" className="section border-y border-line bg-surface" aria-labelledby="demo-title">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow">Try it</p>
            <h2 id="demo-title" className="h2 mt-2">
              A real {ind.short.toLowerCase()} enquiry, answered
            </h2>
          </div>
          <LazyAiDemo enquiries={demo} />
        </div>
      </section>

      <section className="section" aria-labelledby="mods-title">
        <div className="container-page">
          <h2 id="mods-title" className="h2 text-center">
            Built for {ind.short.toLowerCase()}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <li key={m.name} className="card flex flex-col p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
                  <ReleaseBadge version={m.version} />
                </div>
                <h3 className="mt-3 font-semibold text-ink">{m.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{m.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center">
            <Link href="/features" className="inline-flex items-center gap-1 font-semibold text-brand-ink hover:underline">
              See every feature <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className="pb-12" aria-labelledby="other-title">
        <div className="container-page">
          <h2 id="other-title" className="text-center text-sm font-semibold text-muted">
            Maa One for other businesses
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {industries
              .filter((i) => i.slug !== ind.slug)
              .map((i) => (
                <li key={i.slug}>
                  <Link href={`/for/${i.slug}`} className="block rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-brand-ink/40 hover:text-brand-ink">
                    {i.short}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
