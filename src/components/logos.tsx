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

/** Maa Labs: the gold ML monogram with "MAA LABS". Size with a text-* class. */
export function MaaLabsLogo({ className = "", withMark = true }: { className?: string; withMark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[0.35em] leading-none ${className}`}>
      {withMark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/maa-labs-mark-96.webp"
          srcSet="/brand/maa-labs-mark-96.webp 96w, /brand/maa-labs-mark-192.webp 192w, /brand/maa-labs-mark-288.webp 288w"
          sizes="48px"
          width={96}
          height={88}
          alt=""
          className="h-[1.5em] w-auto"
        />
      )}
      <span className="font-extrabold tracking-[0.06em] text-ink uppercase">
        Maa <span className="bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-amber-500">Labs</span>
      </span>
    </span>
  );
}

/** NaveenCodes: orange </> with NAVEEN + orange CODES, as in the brand banner. Size with a text-* class. */
export function NaveenCodesLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.3em] leading-none font-extrabold tracking-[0.04em] uppercase ${className}`}>
      <span className="text-orange-600 dark:text-orange-400" aria-hidden="true">
        &lt;/&gt;
      </span>
      <span>
        <span className="text-ink">Naveen</span>
        <span className="text-orange-600 dark:text-orange-400">Codes</span>
      </span>
    </span>
  );
}
