import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FinalCta } from "@/components/final-cta";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { formatContentDate, getPost, getPosts } from "@/lib/content";
import { site } from "@/site.config";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, authors: [post.author] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: site.company, url: site.url },
          mainEntityOfPage: `${site.url}/blog/${post.slug}`,
        }}
      />
      <article className="container-page max-w-3xl py-12 sm:py-16">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All posts
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          <time dateTime={post.date}>{formatContentDate(post.date)}</time> · {post.author}
        </p>
        <div className="mt-10">
          <Mdx source={post.body} />
        </div>
      </article>
      <FinalCta />
    </>
  );
}
