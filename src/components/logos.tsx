import Link from "next/link";
import { LotusMark } from "./lotus-mark";
import { site } from "@/site.config";

/** App-icon style mark: saffron lotus on an indigo tile. */
export function MaaOneMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-[28%] bg-brand ${className}`} aria-hidden="true">
      <LotusMark className="h-[78%] w-[78%]" strokeWidth={2.8} />
    </span>
  );
}

/** "Maa" in indigo, "One" in saffron — as in the app. */
export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight whitespace-nowrap ${className}`}>
      <span className="text-brand-ink">Maa</span>{" "}
      <span className="bg-gradient-to-b from-amber-400 to-orange-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-orange-400">
        One
      </span>
    </span>
  );
}

export function MaaOneLogo({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  const img = site.logoImage;
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg" aria-label={`${site.name} home`}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} width={img.width} height={img.height} alt="" className="h-10 w-auto" />
      ) : (
        <>
          <LotusMark className="h-10 w-10" />
          <span className="flex flex-col leading-none">
            <Wordmark />
            <span className="mt-1 text-[9.5px] font-semibold tracking-[0.18em] text-muted uppercase">
              {subtitle ?? "Business Growth Platform"}
            </span>
          </span>
        </>
      )}
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
