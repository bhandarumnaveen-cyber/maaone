import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Blog and changelog read MDX from content/ at render time (including ISR revalidation).
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
    "/changelog": ["./content/changelog/**/*"],
    "/sitemap.xml": ["./content/**/*"],
  },
  poweredByHeader: false,
};

export default nextConfig;
