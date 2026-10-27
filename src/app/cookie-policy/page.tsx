import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${site.name} uses cookies and similar technologies.`,
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This policy explains how {site.company} uses cookies and similar technologies (such as
        local storage) on this website and in {site.name}.
      </p>

      <h2>1. What we use</h2>
      <ul>
        <li>
          <strong>Strictly necessary:</strong> keep you logged in, protect forms from abuse and
          process payments securely. These cannot be switched off.
        </li>
        <li>
          <strong>Preferences:</strong> remember choices such as light or dark mode.
        </li>
        <li>
          <strong>Analytics:</strong> privacy-friendly, aggregated statistics about which pages are
          used, so we can improve the site. We do not use advertising cookies.
        </li>
      </ul>

      <h2>2. Third parties</h2>
      <p>
        Razorpay may set cookies during checkout to process payments and prevent fraud. Their use is
        covered by Razorpay&rsquo;s own policies.
      </p>

      <h2>3. Managing cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. Blocking strictly necessary
        cookies will stop login and checkout from working.
      </p>
    </LegalPage>
  );
}
