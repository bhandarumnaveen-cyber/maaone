import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  body: string;
};

export type Release = {
  slug: string;
  version: string;
  title: string;
  date: string;
  body: string;
};

async function readCollection(dir: string) {
  const full = path.join(ROOT, dir);
  const files = (await readdir(full).catch(() => [])).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
  return Promise.all(
    files.map(async (f) => {
      const { data, content } = matter(await readFile(path.join(full, f), "utf8"));
      return { slug: f.replace(/\.mdx$/, ""), data, body: content };
    }),
  );
}

/** YAML turns unquoted dates into Date objects; normalise to YYYY-MM-DD. */
const toDay = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));

const byDateDesc = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);

/** Frontmatter: title, description, date (YYYY-MM-DD), author, draft. */
export async function getPosts(): Promise<BlogPost[]> {
  return (await readCollection("blog"))
    .filter((p) => !p.data.draft)
    .map((p) => ({
      slug: p.slug,
      title: String(p.data.title),
      description: String(p.data.description ?? ""),
      date: toDay(p.data.date),
      author: String(p.data.author ?? "Naveen Goyal"),
      body: p.body,
    }))
    .sort(byDateDesc);
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

/** Frontmatter: version, title, date (YYYY-MM-DD), draft. */
export async function getReleases(): Promise<Release[]> {
  return (await readCollection("changelog"))
    .filter((r) => !r.data.draft)
    .map((r) => ({
      slug: r.slug,
      version: String(r.data.version),
      title: String(r.data.title),
      date: toDay(r.data.date),
      body: r.body,
    }))
    .sort(byDateDesc);
}

export const formatContentDate = (d: string) =>
  new Date(`${d}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
