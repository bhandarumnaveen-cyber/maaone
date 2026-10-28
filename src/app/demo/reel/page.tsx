import type { Metadata } from "next";
import { ProductTour } from "@/components/product-tour";

export const metadata: Metadata = {
  title: "Product demo (video frame)",
  robots: { index: false, follow: false },
};

/**
 * The product tour as a full-screen 9:16 frame, used to record the demo video for Instagram
 * Reels, YouTube Shorts and WhatsApp Status (scripts/record-demo.mjs). Not linked from the site.
 */
export default function DemoReel() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0e0d26]">
      <div className="aspect-[9/16] h-dvh max-w-full">
        <ProductTour variant="reel" />
      </div>
    </main>
  );
}
