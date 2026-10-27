import type { Metadata } from "next";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideas and guides for Indian service businesses, from the Maa One team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <PageHero eyebrow="Blog" title="Coming soon">
      Guides on winning more customers on WhatsApp, GST invoicing and running a service business —
      the first posts arrive before launch.
    </PageHero>
  );
}
