import Link from "next/link";
import { site } from "@/site.config";

/** The brand logo image. `className` sets the height; width follows the aspect ratio. */
export function BrandLogo({ className = "h-12", priority }: { className?: string; priority?: boolean }) {
  const l = site.logo;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={l.src}
      srcSet={l.srcSet}
      sizes="(min-width: 640px) 200px, 160px"
      width={l.width}
      height={l.height}
      alt="Maa One — Business Growth Platform, a Maa Labs product"
      className={`w-auto ${className}`}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}

export function MaaOneLogo({ href = "/", className = "h-12 sm:h-[52px]" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center rounded-lg" aria-label={`${site.name} home`}>
      <BrandLogo className={className} priority />
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
