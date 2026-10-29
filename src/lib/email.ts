import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getSettings } from "@/lib/settings";
import { site } from "@/site.config";
import type { Brand, Email } from "@/lib/email-templates";

type Attachment = { filename: string; content: Uint8Array };

let transporter: Transporter | null = null;

/** SMTP settings from the environment (Hostinger: smtp.hostinger.com, port 465, SSL). */
function smtp() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return { host: process.env.SMTP_HOST || "smtp.hostinger.com", port, secure: port === 465, auth: { user, pass } };
}

export const emailConfigured = () => smtp() !== null;

function getTransporter() {
  const cfg = smtp();
  if (!cfg) return null;
  transporter ??= nodemailer.createTransport({ ...cfg, pool: true, maxConnections: 2, connectionTimeout: 10_000, socketTimeout: 20_000 });
  return transporter;
}

/** Brand details used by every template, from the live settings. */
export async function getBrand(): Promise<Brand> {
  const s = await getSettings();
  return {
    siteUrl: site.url,
    supportEmail: s.supportEmail,
    whatsappDisplay: s.whatsappDisplay,
    whatsappLink: s.whatsappLink,
    instagramUrl: s.instagramUrl,
  };
}

/** Where admin alerts go (ADMIN_ALERT_EMAIL, else the support email). */
export async function adminAlertAddress() {
  return process.env.ADMIN_ALERT_EMAIL || (await getSettings()).supportEmail;
}

/**
 * Sends one email through SMTP. Never throws: without SMTP settings, or if sending fails,
 * it logs and returns false so the payment, signup or form that triggered it still succeeds.
 */
export async function sendEmail(to: string | null | undefined, email: Email, opts: { attachments?: Attachment[]; replyTo?: string } = {}) {
  if (!to) return false;
  const t = getTransporter();
  if (!t) {
    console.info(`[email skipped: SMTP not configured] ${email.subject} → ${to}`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `${site.name} <${process.env.SMTP_USER}>`,
      to,
      replyTo: opts.replyTo || process.env.EMAIL_REPLY_TO || (await getSettings()).supportEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content), contentType: "application/pdf" })),
    });
    return true;
  } catch (e) {
    console.error("[email]", email.subject, e);
    return false;
  }
}
