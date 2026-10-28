"use client";

import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Cloudflare Turnstile widget. Adds a `cf-turnstile-response` field to the form. Renders nothing without a site key. */
export function Turnstile() {
  if (!SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="auto" data-size="flexible" />
    </>
  );
}

/** Turnstile tokens are single-use: get a fresh one after a failed submission. */
export function resetTurnstile() {
  (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
}
