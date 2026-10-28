import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${site.name}, provided by ${site.company}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms form an agreement between you (the business using {site.name}) and{" "}
        {site.company} (&ldquo;Maa Labs&rdquo;, &ldquo;we&rdquo;). By joining the waitlist,
        creating an account or using {site.name}, you accept them.
      </p>

      <h2>1. The Service</h2>
      <p>
        {site.name} is software that helps service businesses manage leads, customers, work and
        payments. Features are released in versions as described on our roadmap; release dates are
        estimates and may change.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 18 and authorised to act for your business.</li>
        <li>You are responsible for activity under your account and for keeping access secure.</li>
        <li>Information you give us, including GSTIN and billing details, must be accurate.</li>
      </ul>

      <h2>3. Plans, trial and payment</h2>
      <ul>
        <li>Paid plans are billed monthly or yearly in advance through Razorpay.</li>
        <li>
          New accounts get a free trial. Unless you cancel before it ends, the plan you chose
          starts and is charged automatically.
        </li>
        <li>Prices exclude GST, which is added at the applicable rate (currently 18%).</li>
        <li>
          WhatsApp message charges levied by Meta are passed through at cost and billed
          separately.
        </li>
        <li>
          We may change prices with at least 30 days&rsquo; notice; changes apply from your next
          renewal.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>
        You will not use {site.name} to send spam or unsolicited messages, break WhatsApp or Meta
        policies, break any law, or upload content you have no right to use. You are responsible
        for having your customers&rsquo; consent to contact them.
      </p>

      <h2>5. AI features</h2>
      <p>
        AI reply drafts and lead scores are suggestions. You review and approve messages before
        they are sent and remain responsible for what you send.
      </p>

      <h2>6. Your data</h2>
      <p>
        You own the data you put into {site.name}. You give us permission to process it only to
        provide the Service, as described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>7. Availability and changes</h2>
      <p>
        We work to keep {site.name} available and secure but cannot promise uninterrupted service.
        We may improve, change or retire features, and will give reasonable notice of changes that
        materially reduce what your plan includes.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the extent the law allows, our total liability for any claim is limited to the fees you
        paid us in the 12 months before the claim, and we are not liable for indirect losses such
        as lost profits or lost business.
      </p>

      <h2>9. Termination</h2>
      <p>
        You can cancel at any time (see our <a href="/cancellation-policy">Cancellation Policy</a>).
        We may suspend or close accounts that break these terms or do not pay.
      </p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of India.</p>
    </LegalPage>
  );
}
