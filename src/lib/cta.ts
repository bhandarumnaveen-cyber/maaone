import type { Settings } from "./types";

/** The main call to action: waitlist before launch, free trial after. */
export function primaryCta(s: Pick<Settings, "salesOpen" | "trialDays">, plan = "growth") {
  return s.salesOpen
    ? { label: `Start ${s.trialDays}-day free trial`, href: `/signup?plan=${plan}` }
    : { label: "Join the waitlist", href: `/waitlist?plan=${plan}` };
}
