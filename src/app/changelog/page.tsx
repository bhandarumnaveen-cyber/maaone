import type { Metadata } from "next";
import Link from "next/link";
import { Mdx } from "@/components/mdx";
import { PageHero } from "@/components/ui";
import { formatContentDate, getReleases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every Maa One release, with its date and what changed.",
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogPage() {
  const releases = await getReleases();
  return (
    <>
      <PageHero eyebrow="Changelog" title="What's new in Maa One">
        Every release, with its date and what changed. For what&rsquo;s coming next, see the{" "}
        <Link href="/roadmap" className="font-medium text-brand-ink underline underline-offset-2">
          roadmap
        </Link>
        .
      </PageHero>
      <section className="section">
        <div className="container-page max-w-3xl">
          {releases.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="font-semibold text-ink">No releases yet</p>
              <p className="mt-1 text-muted">Maa One v1 ships in January 2027. Every release will be listed here.</p>
            </div>
          ) : (
            <ol className="space-y-12">
              {releases.map((r) => (
                <li key={r.slug} id={r.slug} className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                  <div>
                    <span className="rounded-lg bg-brand px-2 py-0.5 text-sm font-bold text-white">{r.version}</span>
                    <p className="mt-2 text-sm text-muted">
                      <time dateTime={r.date}>{formatContentDate(r.date)}</time>
                    </p>
                  </div>
                  <article>
                    <h2 className="text-2xl font-bold text-ink">{r.title}</h2>
                    <div className="mt-4">
                      <Mdx source={r.body} />
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
