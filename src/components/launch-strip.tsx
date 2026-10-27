import { Rocket } from "lucide-react";
import { Countdown } from "./countdown";
import { ButtonLink } from "./ui";
import { getSettings } from "@/lib/settings";
import { primaryCta } from "@/lib/cta";
import { getWaitlistCount } from "@/lib/waitlist";

export async function LaunchStrip() {
  const s = await getSettings();
  if (s.salesOpen) return null;
  const count = await getWaitlistCount();
  const cta = primaryCta(s);
  return (
    <section aria-label="Launch date" className="bg-brand">
      <div className="container-page flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-slate-950">
            <Rocket className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold text-white">Launching {s.launchDateLabel}</p>
            <p className="text-sm text-indigo-100">
              {count !== null && count > 0
                ? `${count.toLocaleString("en-IN")} businesses are already on the waitlist.`
                : "Join the waitlist to be first in line when Maa One opens."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Countdown to={s.launchDateIso} />
          <ButtonLink href={cta.href} variant="accent">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
