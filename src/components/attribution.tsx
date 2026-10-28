"use client";

import { useEffect } from "react";

const KEYS = { ref: "maa_ref", utm_source: "maa_utm" } as const;

/** Remembers ?ref= and ?utm_source= for this visit, so a later waitlist signup still credits them. */
export function Attribution() {
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      for (const [param, key] of Object.entries(KEYS)) {
        const v = p.get(param);
        if (v) sessionStorage.setItem(key, v.slice(0, 50));
      }
    } catch {}
  }, []);
  return null;
}

export function readAttribution() {
  try {
    return { ref: sessionStorage.getItem(KEYS.ref) ?? undefined, utm: sessionStorage.getItem(KEYS.utm_source) ?? undefined };
  } catch {
    return {};
  }
}
