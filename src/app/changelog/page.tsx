import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every Maa One release, with its date and what changed.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return (
    <PageHero eyebrow="Changelog" title="No releases yet">
      Maa One v1 ships in January 2027. Every release will be listed here with its date and
      changes. Until then, see the{" "}
      <Link href="/roadmap" className="font-medium text-brand-ink underline underline-offset-2">
        roadmap
      </Link>
      .
    </PageHero>
  );
}
