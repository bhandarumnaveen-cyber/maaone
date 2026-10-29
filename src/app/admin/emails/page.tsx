import { CheckCircle2, AlertTriangle } from "lucide-react";
import { getBrand, emailConfigured } from "@/lib/email";
import { authTemplates } from "@/lib/email-templates";
import { sampleEmails } from "@/lib/email-samples";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/dashboard-ui";
import { EmailPreviewList, AuthTemplateCard } from "@/components/admin/email-previews";

export const metadata = { title: "Emails" };

export default async function AdminEmails() {
  const [brand, settings] = await Promise.all([getBrand(), getSettings()]);
  const emails = sampleEmails(brand, settings).map((e) => ({ key: e.key, label: e.label, when: e.when, subject: e.email.subject, html: e.email.html }));
  const auth = authTemplates(brand);
  const smtpOk = emailConfigured();
  return (
    <>
      <PageHeader title="Emails" description="Every email Maa One sends, with a live preview. Send yourself a test to check how it looks in your inbox." />

      <div className={`card mb-6 flex items-start gap-3 p-4 ${smtpOk ? "" : "border-amber-300"}`}>
        {smtpOk ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" aria-hidden="true" />}
        <div className="text-sm">
          <p className="font-semibold text-ink">{smtpOk ? `Sending through ${process.env.SMTP_HOST || "smtp.hostinger.com"} as ${process.env.EMAIL_FROM || process.env.SMTP_USER}` : "SMTP isn't set up yet — emails are skipped and logged."}</p>
          {!smtpOk && (
            <p className="mt-1 text-muted">
              Add <code>SMTP_USER</code>, <code>SMTP_PASS</code> and <code>EMAIL_FROM</code> in Hostinger → Environment variables and redeploy. Admin alerts go to{" "}
              <code>{process.env.ADMIN_ALERT_EMAIL || settings.supportEmail}</code>.
            </p>
          )}
        </div>
      </div>

      <EmailPreviewList emails={emails} canSend={smtpOk} />

      <h2 className="mt-12 text-lg font-bold text-ink">Login and account emails (Supabase)</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Supabase sends these itself. In Supabase → Authentication → Emails, set SMTP to the same Hostinger mailbox, then paste each subject and
        HTML into the template with the same name. <code>{"{{ .Token }}"}</code> is the 6-digit code.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {auth.map((a) => (
          <AuthTemplateCard key={a.key} name={a.supabaseName} subject={a.subject} html={a.html} />
        ))}
      </div>
    </>
  );
}
