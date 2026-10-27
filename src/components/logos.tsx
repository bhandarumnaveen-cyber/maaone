import Link from "next/link";
import { site } from "@/site.config";

/** Maa One mark: an indigo tile with a saffron dot — "one" place for everything. */
export function MaaOneMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#3730A3" />
      <path
        d="M8 22V11.5c0-.6.7-.9 1.1-.5l5.5 5.6c.8.8 2 .8 2.8 0l5.5-5.6c.4-.4 1.1-.1 1.1.5V22"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="24.2" r="2.2" fill="#F59E0B" />
    </svg>
  );
}

export function MaaOneLogo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg font-bold tracking-tight text-ink"
      aria-label={`${site.name} home`}
    >
      <MaaOneMark />
      <span className="text-lg whitespace-nowrap">
        Maa <span className="text-brand-ink">One</span>
      </span>
    </Link>
  );
}

/** Text logo until the real Maa Labs logo file is uploaded. */
export function MaaLabsLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight text-ink ${className}`}>
      Maa<span className="text-accent-ink">Labs</span>
    </span>
  );
}

/** Text logo until the real NaveenCodes logo file is uploaded. */
export function NaveenCodesLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-mono font-bold tracking-tight text-ink ${className}`}>
      <span className="text-brand-ink">&lt;</span>NaveenCodes<span className="text-brand-ink">/&gt;</span>
    </span>
  );
}
