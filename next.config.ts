import type { NextConfig } from "next";

/**
 * Sent on every response. No script-src CSP: Razorpay Checkout, Turnstile and the
 * optional analytics load third-party scripts, so only the rules that can't break them are set.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
