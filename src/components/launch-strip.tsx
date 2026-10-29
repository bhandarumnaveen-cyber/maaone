import { Rocket, Sparkles } from "lucide-react";
import { ButtonLink } from "./ui";
import { getSettings } from "@/lib/settings";
import { primaryCta } from "@/lib/cta";
import { getWaitlistCount } from "@/lib/waitlist";

/** The launch year with each digit rolling into place (odometer), then a slow golden shine. */
export function LaunchYear({ year, className = "" }: { year: string; className?: string }) {
  return (
    <span className={`launch-year ${className}`} aria-label={year} role="img">
      {[...year].map((d, i) => (
        <span key={i} className="launch-digit" aria-hidden="true">
          <span className="launch-reel" style={{ "--d": Number(d) + 10, "--i": i } as React.CSSProperties}>
            {Array.from({ length: 20 }, (_, n) => (
              <span key={n}>{n % 10}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

export async function LaunchStrip() {
  const s = await getSettings();
  if (s.salesOpen) return null;
  const count = await getWaitlistCount();
  const cta = primaryCta(s);
  return (
    <section aria-label={`Launching in ${s.launchYear}`} className="relative overflow-hidden bg-[linear-gradient(120deg,#1e1b4b_0%,#3730a3_55%,#4338ca_100%)]">
      <div className="pointer-events-none absolute -top-24 right-[18%] h-64 w-64 rounded-full bg-amber-400/25 blur-3xl" aria-hidden="true" />
      <div className="launch-stars pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-page relative flex flex-col gap-6 py-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="launch-rocket flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-slate-950 shadow-lg shadow-amber-500/30">
            <Rocket className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.16em] text-amber-300 uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Maa Labs&rsquo; biggest launch
            </p>
            <p className="mt-1 text-xl font-bold text-white sm:text-2xl">Maa One is coming in {s.launchYear}</p>
            <p className="mt-1 text-sm text-indigo-100">
              {count !== null && count > 0
                ? `${count.toLocaleString("en-IN")} businesses are already on the waitlist — free pilot first, then launch.`
                : "Join the waitlist — early businesses get the free pilot first."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <LaunchYear year={s.launchYear} className="text-5xl sm:text-6xl" />
            <span className="text-xs leading-tight font-semibold tracking-wide text-indigo-200 uppercase">
              Launch
              <br />
              year
            </span>
          </div>
          <ButtonLink href={cta.href} variant="accent" size="lg" className="shadow-lg shadow-amber-500/20">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
