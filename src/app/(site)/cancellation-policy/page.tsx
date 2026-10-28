import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `How to cancel a ${site.name} subscription and what happens to your account.`,
  alternates: { canonical: "/cancellation-policy" },
};

export default async function CancellationPage() {
  const cfg = await getSettings();
  return (
    <LegalPage title="Cancellation Policy">
      <p>You can cancel your {site.name} subscription at any time. There are no cancellation fees.</p>

      <h2>1. How to cancel</h2>
      <ul>
        <li>
          Log in to your account (available from launch), open <strong>My plan</strong> and choose{" "}
          <strong>Cancel subscription</strong>, or
        </li>
        <li>
          email <a href={`mailto:${cfg.supportEmail}`}>{cfg.supportEmail}</a> from your registered
          email address.
        </li>
      </ul>

      <h2>2. During the free trial</h2>
      <p>
        Cancel any time before the {cfg.trialDays}-day trial ends and you will not be charged.
      </p>

      <h2>3. After the trial</h2>
      <p>
        Your plan stays active until the end of the period you have already paid for, then stops
        renewing. You will not be charged again. Refunds follow our{" "}
        <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>4. Your data after cancelling</h2>
      <p>
        You can export your data until the paid period ends. We keep your account data for 90 days
        after that so you can come back, then delete it, except records we must keep by law (such
        as invoices).
      </p>

      <h2>5. Changing plans</h2>
      <p>
        Upgrades apply immediately with the difference charged pro rata. Downgrades apply from your
        next renewal date.
      </p>
    </LegalPage>
  );
}
