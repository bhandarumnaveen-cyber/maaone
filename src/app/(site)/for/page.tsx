import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui";
import { industries } from "@/data/industries";

export const metadata: Metadata = {
  title: "Maa One for your business",
  description: "How Maa One helps AC repair, salons, clinics, real estate, coaching centres and interior designers win more customers.",
  alternates: { canonical: "/for" },
};

export default function IndustriesIndex() {
  return (
    <>
      <PageHero eyebrow="Solutions" title="Maa One for your business">
        Every service business wins customers the same way — by replying first. See how Maa One works for yours.
      </PageHero>
      <section className="section">
        <div className="container-page">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((i) => (
              <li key={i.slug}>
                <Link href={`/for/${i.slug}`} className="card group flex h-full flex-col p-6 shadow-sm transition-colors hover:border-brand-ink/40">
                  <p className="eyebrow">{i.short}</p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{i.headline}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted">{i.metaDescription}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-ink">
                    See how <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
