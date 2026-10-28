import { redirect } from "next/navigation";
import { loadAccount } from "@/lib/account";
import { getPlans, getSettings } from "@/lib/settings";
import { SubscriptionCard } from "@/components/account/subscription-card";
import { PageHeader } from "@/components/dashboard-ui";

export const metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const [acct, settings, plans] = await Promise.all([loadAccount(), getSettings(), getPlans()]);
  if (!acct) redirect("/login?next=/account/subscription");
  return (
    <>
      <PageHeader title="Subscription" description="Your plan, renewal date, and options to upgrade, downgrade or cancel." />
      <div className="max-w-3xl">
        <SubscriptionCard sub={acct.sub} live={acct.live} plans={plans} settings={settings} manage />
      </div>
    </>
  );
}
