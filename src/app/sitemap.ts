import type { MetadataRoute } from "next";
import { getPosts, getReleases } from "@/lib/content";
import { site } from "@/site.config";
import { industries } from "@/data/industries";

const pages = [
  { path: "", priority: 1 },
  { path: "/hi", priority: 0.9 },
  { path: "/features", priority: 0.9 },
  { path: "/pricing", priority: 0.9 },
  { path: "/roadmap", priority: 0.8 },
  { path: "/waitlist", priority: 0.8 },
  { path: "/for", priority: 0.7 },
  ...industries.map((i) => ({ path: `/for/${i.slug}`, priority: 0.7 })),
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/blog", priority: 0.6 },
  { path: "/changelog", priority: 0.5 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
  { path: "/refund-policy", priority: 0.2 },
  { path: "/cancellation-policy", priority: 0.2 },
  { path: "/cookie-policy", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, releases] = await Promise.all([getPosts(), getReleases()]);
  return [
    ...pages.map((p) => ({ url: `${site.url}${p.path}`, priority: p.priority, changeFrequency: "weekly" as const })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.5 })),
    ...(releases[0] ? [{ url: `${site.url}/changelog`, lastModified: releases[0].date }] : []),
  ];
}
