import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { formatContentDate, getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideas and guides for Indian service businesses, from the Maa One team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero eyebrow="Blog" title="Ideas for growing a service business">
        Practical guides on winning customers, getting paid and running your business — plus news about Maa One.
      </PageHero>
      <section className="section">
        <div className="container-page max-w-3xl">
          {posts.length === 0 ? (
            <p className="text-muted">The first posts are on their way.</p>
          ) : (
            <ul className="space-y-6">
              {posts.map((p) => (
                <li key={p.slug}>
                  <article className="card relative p-6 transition-colors hover:border-brand-ink/40">
                    <p className="text-sm text-muted">
                      <time dateTime={p.date}>{formatContentDate(p.date)}</time> · {p.author}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-ink">
                      <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 hover:text-brand-ink">
                        {p.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-muted">{p.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
