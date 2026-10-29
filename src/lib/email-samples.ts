import * as T from "./email-templates";
import type { Brand, Email } from "./email-templates";
import type { Settings } from "./types";

/** Every email with sample data, for /admin/emails previews and test sends. */
export function sampleEmails(b: Brand, s: Settings): { key: string; label: string; when: string; email: Email }[] {
  const inAWeek = new Date(Date.now() + 7 * 864e5).toISOString();
  const inAMonth = new Date(Date.now() + 30 * 864e5).toISOString();
  return [
    { key: "welcome", label: "Welcome", when: "First login after creating an account", email: T.welcomeEmail(b, { name: "Harleen Kaur", salesOpen: s.salesOpen, launchYear: s.launchYear, trialDays: s.trialDays }) },
    { key: "waitlist", label: "Waitlist joined", when: "Someone joins the waitlist", email: T.waitlistEmail(b, { name: "Harleen Kaur", position: 128, launchYear: s.launchYear, trialDays: s.trialDays }) },
    { key: "trial", label: "Free trial started", when: "Razorpay confirms a new subscription with a trial", email: T.trialStartedEmail(b, { planName: "Growth", trialDays: s.trialDays, trialEnds: inAWeek, firstCharge: "₹1,768.82 incl. GST", appUrl: s.appUrl, appReady: s.appReady }) },
    { key: "payment", label: "Payment received + invoice", when: "Every successful charge (GST invoice PDF attached)", email: T.paymentReceivedEmail(b, { first: true, amount: "₹1,768.82", invoiceNumber: "ML/2026-27/0042", planName: "Growth", period: "Monthly", paidOn: T.istDate(new Date().toISOString())!, nextDate: T.istDate(inAMonth), appUrl: s.appUrl, appReady: s.appReady }) },
    { key: "payment-failed", label: "Payment failed", when: "A renewal charge fails", email: T.paymentFailedEmail(b) },
    { key: "renewal", label: "Renewal reminder", when: "3 days (monthly) or 7 days (yearly) before renewal", email: T.renewalReminderEmail(b, { planName: "Growth", amount: "₹1,768.82", date: T.istDate(inAWeek)! }) },
    { key: "plan-changed", label: "Plan changed", when: "Upgrade (now) or downgrade (at renewal)", email: T.planChangedEmail(b, { from: "Starter", to: "Growth", period: "Monthly", when: "now" }) },
    { key: "cancel-scheduled", label: "Cancellation confirmed", when: "A paid plan is cancelled (access until period end)", email: T.cancelledEmail(b, { endsAt: inAMonth, scheduled: true }) },
    { key: "cancelled", label: "Subscription ended", when: "Razorpay ends the subscription", email: T.cancelledEmail(b, { endsAt: null, scheduled: false }) },
    { key: "refund", label: "Refund request received", when: "A customer asks for a refund on an invoice", email: T.refundRequestedEmail(b, { invoiceNumber: "ML/2026-27/0042", amount: "₹1,768.82", reason: "I subscribed to the wrong plan by mistake." }) },
    { key: "ticket", label: "Support request received", when: "A customer opens a support ticket", email: T.ticketReceivedEmail(b, { subject: "How do I connect my WhatsApp number?" }) },
    { key: "support-reply", label: "Support reply", when: "An admin replies to a ticket", email: T.supportReplyEmail(b, { subject: "How do I connect my WhatsApp number?", reply: "Hi Harleen! Open Settings → Channels and tap Connect next to WhatsApp Business. It takes about 2 minutes — we're happy to do it with you on a call.", closed: false }) },
    { key: "contact", label: "Contact form auto-reply", when: "Someone sends the contact form", email: T.contactReceivedEmail(b, { name: "Rohit Deshmukh" }) },
    {
      key: "admin-alert",
      label: "Admin alert (example)",
      when: "To the team: contact, feature request, support, refund, new trial, payment",
      email: T.adminAlertEmail(b, { subject: "Refund request", heading: "A customer asked for a refund", rows: [["Customer", "harleen@example.com"], ["Invoice", "ML/2026-27/0042"], ["Amount", "₹1,768.82"]], message: { label: "Reason", text: "I subscribed to the wrong plan by mistake." }, link: { label: "Open support tickets", href: `${b.siteUrl}/admin/support` } }),
    },
  ];
}
