import type { Metadata } from "next";
import { ProductFilm } from "@/components/product-film";

export const metadata: Metadata = {
  title: "Product demo (video frame)",
  robots: { index: false, follow: false },
};

/**
 * The product film as a full-screen frame for recording the demo video (scripts/record-demo.mjs):
 * ?format=landscape (16:9, YouTube and the website) or portrait (9:16, Reels, Shorts, Status).
 * Not linked from the site.
 */
export default async function DemoReel({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  const { format } = await searchParams;
  const f = format === "landscape" ? "landscape" : "portrait";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0e0d26]">
      <div className={f === "landscape" ? "w-full" : "aspect-[9/16] h-dvh max-w-full"}>
        <ProductFilm format={f} controls={false} />
      </div>
    </main>
  );
}
