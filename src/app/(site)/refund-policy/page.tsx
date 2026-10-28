import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `When and how ${site.company} refunds payments for ${site.name}.`,
  alternates: { canonical: "/refund-policy" },
};

export default async function RefundPage() {
  const cfg = await getSettings();
  return (
    <LegalPage title="Refund Policy">
      <p>
        Every {site.name} plan starts with a {cfg.trialDays}-day free trial so you can try it fully
        before paying. Because of this, payments are generally non-refundable, with the exceptions
        below.
      </p>

      <h2>1. When we refund</h2>
      <ul>
        <li>
          <strong>Charged after cancelling:</strong> if you cancelled during the trial or before a
          renewal and were still charged, we refund that charge in full.
        </li>
        <li>
          <strong>Duplicate or wrong charges:</strong> refunded in full.
        </li>
        <li>
          <strong>Yearly plans:</strong> if you cancel within 7 days of the first yearly payment
          (not a renewal), we refund the full amount.
        </li>
        <li>
          <strong>Extended outage:</strong> if {site.name} is unavailable for more than 72 hours in a
          row because of a fault on our side, we credit or refund the affected days on request.
        </li>
      </ul>

      <h2>2. What we don&rsquo;t refund</h2>
      <ul>
        <li>Partial months on monthly plans after cancellation.</li>
        <li>WhatsApp message charges already paid to Meta.</li>
      </ul>

      <h2>3. How to ask for a refund</h2>
      <p>
        Email <a href={`mailto:${cfg.supportEmail}`}>{cfg.supportEmail}</a> with your registered
        email or phone number and the invoice number. We reply within 2 working days. Approved
        refunds go back to the original payment method within 5–7 working days, and we issue a GST
        credit note.
      </p>
    </LegalPage>
  );
}
