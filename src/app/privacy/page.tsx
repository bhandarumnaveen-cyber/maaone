import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.company} collects, uses and protects your data when you use ${site.name}.`,
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const cfg = await getSettings();
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains how {site.company} (&ldquo;Maa Labs&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses, shares and protects personal data when you visit{" "}
        {site.url.replace("https://", "")}, join the waitlist, or use {site.name} (the
        &ldquo;Service&rdquo;). {site.company} is the data fiduciary for data about our own
        customers and website visitors.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Information you give us:</strong> name, business name, business type, city, phone
          number, email, plan of interest, billing details (business name, GSTIN, billing address)
          and anything you write to us.
        </li>
        <li>
          <strong>Account data:</strong> login identifiers (email or phone number) and one-time
          password verification records.
        </li>
        <li>
          <strong>Payment data:</strong> payments are processed by Razorpay. We receive payment
          status and limited details (such as the last four digits of a card or the UPI handle); we
          never store full card numbers.
        </li>
        <li>
          <strong>Usage data:</strong> device, browser, pages visited and approximate location from
          your IP address, used to keep the Service secure and to improve it.
        </li>
      </ul>

      <h2>2. Your customers&rsquo; data inside {site.name}</h2>
      <p>
        When you use {site.name}, you upload or receive data about your own customers (for example
        enquiries, WhatsApp messages and contact details). For that data you are the data fiduciary
        and we act as your data processor: we process it only to provide the Service to you, we do
        not sell it, and we do not use it to market to your customers.
      </p>

      <h2>3. How we use data</h2>
      <ul>
        <li>To run the waitlist and tell you about the pilot and launch.</li>
        <li>To create and secure your account, and to provide the Service.</li>
        <li>To bill you, issue GST invoices and meet tax and legal obligations.</li>
        <li>To provide support and respond to your requests.</li>
        <li>To generate AI reply drafts and lead scores for your enquiries.</li>
        <li>To improve the Service, using aggregated or de-identified data where possible.</li>
      </ul>

      <h2>4. Who we share data with</h2>
      <p>
        We share data only with service providers who help us run {site.name}, under contracts that
        require them to protect it: hosting and database providers, payment processing (Razorpay),
        email delivery, the WhatsApp Business Platform (Meta), and AI model providers used to draft
        replies. We may disclose data where the law requires it. We never sell personal data.
      </p>

      <h2>5. Storage, security and retention</h2>
      <p>
        Data is encrypted in transit and at rest, and access is restricted to people who need it.
        We keep account data for as long as your account is active and as long afterwards as tax
        and accounting law requires. Waitlist data is kept until launch plus 12 months unless you
        ask us to delete it sooner.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to access, correct or erase your personal data, withdraw consent, or nominate
        another person to exercise these rights, by writing to{" "}
        <a href={`mailto:${cfg.supportEmail}`}>{cfg.supportEmail}</a>.
      </p>

      <h2>7. Children</h2>
      <p>{site.name} is a business service and is not meant for anyone under 18.</p>

      <h2>8. Changes</h2>
      <p>
        We will post changes on this page and, for significant changes, tell account holders by
        email.
      </p>
    </LegalPage>
  );
}
