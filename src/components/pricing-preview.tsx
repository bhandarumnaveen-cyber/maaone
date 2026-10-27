import { CardShell } from "./plan-card";
import { primaryCta } from "@/lib/cta";
import { formatMoney } from "@/lib/format";
import type { Plan, Settings } from "@/lib/types";

/** Static monthly-INR plan cards for the home page; /pricing has the toggles. */
export function PricingPreview({ plans, settings }: { plans: Plan[]; settings: Settings }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <CardShell
        name="Free trial"
        summary={`Everything in Growth, free for ${settings.trialDays} days.`}
        price="₹0"
        unit={`for ${settings.trialDays} days`}
        note="Then pick any plan"
        cta={primaryCta(settings, "growth")}
        features={["Everything in Growth", "Every live module, 3 users", `Cancel before day ${settings.trialDays} and pay nothing`]}
      />
      {plans.map((plan) => {
        const cta = primaryCta(settings, plan.code);
        return (
          <CardShell
            key={plan.code}
            name={plan.name}
            summary={plan.tagline}
            popular={plan.popular}
            price={formatMoney(plan.inrMonthly, "INR")}
            unit="/month"
            note={`+ ${settings.gstRate}% GST`}
            cta={{ href: cta.href, label: settings.salesOpen ? `Start with ${plan.name}` : cta.label }}
            features={plan.features}
          />
        );
      })}
    </div>
  );
}
