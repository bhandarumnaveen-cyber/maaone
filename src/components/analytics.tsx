"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "maa_analytics_consent";

type Consent = "granted" | "denied" | null;

/**
 * Microsoft Clarity and/or Google Analytics, loaded only after the visitor accepts.
 * Nothing renders unless NEXT_PUBLIC_CLARITY_ID or NEXT_PUBLIC_GA_ID is set.
 */
export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setConsent((localStorage.getItem(KEY) as Consent) ?? null);
    } catch {}
    setReady(true);
  }, []);

  if (!CLARITY_ID && !GA_ID) return null;

  const decide = (c: "granted" | "denied") => {
    setConsent(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {}
  };

  return (
    <>
      {consent === "granted" && CLARITY_ID && (
        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)});`}
        </Script>
      )}
      {consent === "granted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="lazyOnload" />
          <Script id="ga4" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)},{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {ready && consent === null && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-slate-900/20 sm:bottom-6 sm:left-6 sm:right-auto"
        >
          <p className="text-sm text-ink">
            We use analytics cookies to understand how the site is used and make it better. No advertising cookies.{" "}
            <Link href="/cookie-policy" className="font-medium text-brand-ink underline underline-offset-2">
              Cookie policy
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Accept
            </button>
            <button type="button" onClick={() => decide("denied")} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-2">
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
