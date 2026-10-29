/**
 * Every email Maa One sends, as pure functions: data in, { subject, html, text } out.
 * One branded layout (table-based, inline styles) so they render the same in Gmail, Outlook,
 * Apple Mail and phone apps. No server-only imports, so /admin/emails can preview them.
 */

import { site } from "@/site.config";

export type Brand = {
  siteUrl: string;
  supportEmail: string;
  whatsappDisplay: string;
  whatsappLink: string;
  instagramUrl: string;
};

export type Email = { subject: string; html: string; text: string };

type Tone = "info" | "success" | "warning" | "danger";

type Block =
  | { type: "p"; text: string }
  | { type: "details"; rows: [string, string][] }
  | { type: "callout"; tone: Tone; text: string }
  | { type: "steps"; items: string[] }
  | { type: "code"; value: string; note?: string }
  | { type: "quote"; label: string; text: string }
  | { type: "big"; value: string; label: string };

type Layout = {
  preheader: string;
  eyebrow?: string;
  heading: string;
  blocks: Block[];
  button?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Why the person gets this email (footer). */
  reason: string;
  /** Internal alerts get a slimmer footer. */
  internal?: boolean;
};

const C = {
  indigo: "#3730A3",
  indigoDark: "#1E1B4B",
  saffron: "#F59E0B",
  ink: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  line: "#E2E8F0",
  bg: "#F4F3F8",
};
const FONT = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Escapes text, then turns **bold** into <strong> and keeps line breaks. */
function rich(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.ink}">$1</strong>`)
    .replace(/\n/g, "<br>");
}
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1");

const toneStyle: Record<Tone, { bg: string; border: string; color: string }> = {
  info: { bg: "#EEF2FF", border: "#C7D2FE", color: "#312E81" },
  success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
  danger: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
};

function blockHtml(b: Block): string {
  switch (b.type) {
    case "p":
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${C.body}">${rich(b.text)}</p>`;
    case "details":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border:1px solid ${C.line};border-radius:12px;border-collapse:separate">
${b.rows
  .map(
    ([k, v], i) =>
      `<tr><td style="padding:11px 16px;font-size:13px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ""}">${esc(k)}</td><td align="right" style="padding:11px 16px;font-size:14px;font-weight:600;color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ""}">${rich(v)}</td></tr>`,
  )
  .join("\n")}
</table>`;
    case "callout": {
      const t = toneStyle[b.tone];
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px"><tr><td style="background:${t.bg};border:1px solid ${t.border};border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.6;color:${t.color}">${rich(b.text)}</td></tr></table>`;
    }
    case "steps":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px">
${b.items
  .map(
    (s, i) =>
      `<tr><td valign="top" width="34" style="padding:0 0 12px"><div style="width:24px;height:24px;border-radius:12px;background:${C.indigo};color:#fff;font-size:12px;font-weight:700;line-height:24px;text-align:center">${i + 1}</div></td><td style="padding:2px 0 12px;font-size:14.5px;line-height:1.55;color:${C.body}">${rich(s)}</td></tr>`,
  )
  .join("\n")}
</table>`;
    case "code":
      // Not escaped: it can be a template variable such as {{ .Token }}.
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px"><tr><td align="center" style="background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:14px;padding:20px 12px">
<div style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:${C.indigoDark}">${b.value}</div>
${b.note ? `<div style="margin-top:8px;font-size:12.5px;color:${C.muted}">${rich(b.note)}</div>` : ""}
</td></tr></table>`;
    case "quote":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px"><tr><td style="border-left:4px solid ${C.saffron};background:#FFFBF2;border-radius:0 12px 12px 0;padding:14px 16px">
<div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#B45309">${esc(b.label)}</div>
<div style="margin-top:6px;font-size:14.5px;line-height:1.6;color:${C.ink}">${rich(b.text)}</div></td></tr></table>`;
    case "big":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px"><tr><td align="center" style="background:linear-gradient(135deg,#EEF2FF,#FFF7E8);background-color:#EEF2FF;border-radius:14px;padding:20px 12px">
<div style="font-size:40px;font-weight:800;color:${C.indigo};line-height:1">${esc(b.value)}</div>
<div style="margin-top:6px;font-size:13px;color:${C.muted}">${esc(b.label)}</div></td></tr></table>`;
  }
}

function blockText(b: Block): string {
  switch (b.type) {
    case "p":
      return plain(b.text);
    case "details":
      return b.rows.map(([k, v]) => `${k}: ${plain(v)}`).join("\n");
    case "callout":
      return plain(b.text);
    case "steps":
      return b.items.map((s, i) => `${i + 1}. ${plain(s)}`).join("\n");
    case "code":
      return `${b.value}${b.note ? `\n${plain(b.note)}` : ""}`;
    case "quote":
      return `${b.label}:\n${plain(b.text)}`;
    case "big":
      return `${b.value} — ${b.label}`;
  }
}

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td style="border-radius:12px;background:${C.indigo}">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px">${esc(label)}</a>
</td></tr></table>`;
}

export function render(l: Layout, brand: Brand): Email & { subject: string } {
  const u = brand.siteUrl;
  const footerLinks = [
    ["Website", u],
    ["My account", `${u}/account`],
    ["Help", `${u}/contact`],
    ["WhatsApp", brand.whatsappLink],
  ]
    .map(([k, h]) => `<a href="${esc(h)}" style="color:${C.indigo};text-decoration:none;font-weight:600">${k}</a>`)
    .join(`<span style="color:#CBD5E1">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${esc(l.heading)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(l.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};font-family:${FONT}">
<tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td><a href="${esc(u)}" target="_blank"><img src="${esc(u)}${site.logo.png}" width="170" alt="Maa One" style="display:block;border:0;width:170px;height:auto"></a></td>
  <td align="right" style="font-size:12px;color:${C.muted}">${l.internal ? "Admin alert" : "Poora business, ek app mein"}</td>
  </tr></table>
</td></tr>
<tr><td style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);border:1px solid ${C.line}">
  <div style="height:6px;background:linear-gradient(90deg,${C.indigo},#6366F1,${C.saffron});background-color:${C.indigo};font-size:0;line-height:0">&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 30px 26px">
  ${l.eyebrow ? `<div style="font-size:11.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#B45309;margin:0 0 8px">${esc(l.eyebrow)}</div>` : ""}
  <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;font-weight:800;color:${C.ink}">${esc(l.heading)}</h1>
  ${l.blocks.map(blockHtml).join("\n")}
  ${l.button ? button(l.button.label, l.button.href) : ""}
  ${l.secondary ? `<p style="margin:14px 0 0;font-size:13.5px"><a href="${esc(l.secondary.href)}" style="color:${C.indigo};font-weight:600">${esc(l.secondary.label)} &rarr;</a></p>` : ""}
  </td></tr></table>
</td></tr>
${
  l.internal
    ? ""
    : `<tr><td style="padding:18px 24px 0" align="center">
  <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.6">Questions? Just reply to this email, write to <a href="mailto:${esc(brand.supportEmail)}" style="color:${C.indigo}">${esc(brand.supportEmail)}</a> or WhatsApp us on <a href="${esc(brand.whatsappLink)}" style="color:${C.indigo}">${esc(brand.whatsappDisplay)}</a>.</p>
</td></tr>
<tr><td style="padding:16px 24px 0;font-size:13px" align="center">${footerLinks}</td></tr>`
}
<tr><td style="padding:16px 24px 8px" align="center">
  <p style="margin:0;font-size:11.5px;line-height:1.6;color:#94A3B8">${esc(l.reason)}<br>
  Maa One is a product of <a href="https://maalabs.in" style="color:#94A3B8">Maa Labs Private Limited</a> · Built by <a href="${esc(site.developer.url)}" style="color:#94A3B8">NaveenCodes</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    l.heading,
    "",
    ...l.blocks.map(blockText).flatMap((t) => [t, ""]),
    ...(l.button ? [`${l.button.label}: ${l.button.href}`, ""] : []),
    ...(l.secondary ? [`${l.secondary.label}: ${l.secondary.href}`, ""] : []),
    l.internal ? "" : `Questions? Reply to this email, write to ${brand.supportEmail} or WhatsApp ${brand.whatsappDisplay}.`,
    "",
    l.reason,
    "Maa One — a product of Maa Labs Private Limited · maalabs.in",
  ].join("\n");

  return { subject: "", html, text };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const istDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : null;

const firstName = (name: string | null | undefined) => (name ?? "").trim().split(/\s+/)[0] || "there";

const make = (subject: string, l: Layout, brand: Brand): Email => ({ ...render(l, brand), subject });

/* ------------------------------------------------------------------ */
/* Customer emails                                                     */
/* ------------------------------------------------------------------ */

export function welcomeEmail(b: Brand, o: { name?: string | null; salesOpen: boolean; launchDateLabel: string; trialDays: number }) {
  return make(
    `Welcome to Maa One, ${firstName(o.name)}`,
    {
      preheader: "Your account is ready. Here's how to get started.",
      eyebrow: "Welcome",
      heading: `Welcome to Maa One, ${firstName(o.name)}!`,
      blocks: [
        { type: "p", text: "Your account is ready. Maa One puts every lead from your website and WhatsApp in one inbox, and AI drafts the reply in Hindi, Punjabi or English — you just approve." },
        {
          type: "steps",
          items: o.salesOpen
            ? [
                "**Add your business details** — name, GSTIN (optional) and address for invoices.",
                `**Start your ${o.trialDays}-day free trial** on the plan that fits you. Cancel any time.`,
                "**Connect WhatsApp and your website** in the app and watch the first leads arrive.",
              ]
            : [
                "**Complete your profile** so we know who to reach for the pilot.",
                `**Maa One opens on ${o.launchDateLabel}.** We'll email you the day it does, with a ${o.trialDays}-day free trial.`,
                "**Tell a friend** — businesses that join early get invited to the pilot first.",
              ],
        },
      ],
      button: { label: "Go to my account", href: `${b.siteUrl}/account` },
      secondary: { label: "See what's coming", href: `${b.siteUrl}/roadmap` },
      reason: "You're receiving this because you created a Maa One account.",
    },
    b,
  );
}

export function waitlistEmail(b: Brand, o: { name: string; position?: number; launchDateLabel: string; trialDays: number }) {
  const link = o.position ? `${b.siteUrl}/waitlist?ref=${o.position}` : `${b.siteUrl}/waitlist`;
  return make(
    `You're on the Maa One waitlist${o.position ? ` — #${o.position}` : ""}`,
    {
      preheader: "Thank you for joining. Here's what happens next.",
      eyebrow: "Waitlist",
      heading: `You're in, ${firstName(o.name)}!`,
      blocks: [
        ...(o.position ? [{ type: "big" as const, value: `#${o.position}`, label: "your place on the waitlist" }] : []),
        { type: "p", text: `Thank you for joining. We'll write before the **free pilot in December 2026** and again on **launch day, ${o.launchDateLabel}**, when your ${o.trialDays}-day free trial opens.` },
        { type: "callout", tone: "info", text: `**Move up the list:** share your link with other business owners. People who refer others are invited to the pilot first.\n${link}` },
      ],
      button: { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`I just joined the Maa One waitlist — one app for every lead, reply and payment. Join here: ${link}`)}` },
      secondary: { label: "See the roadmap", href: `${b.siteUrl}/roadmap` },
      reason: "You're receiving this because you joined the Maa One waitlist.",
    },
    b,
  );
}

export function trialStartedEmail(b: Brand, o: { planName: string; trialDays: number; trialEnds: string | null; firstCharge?: string; appUrl: string; appReady: boolean }) {
  const ends = istDate(o.trialEnds);
  return make(
    "Your Maa One free trial has started",
    {
      preheader: ends ? `Free until ${ends}. Cancel any time before then.` : "Cancel any time.",
      eyebrow: "Free trial",
      heading: "Your free trial has started",
      blocks: [
        { type: "p", text: `You're on the **${o.planName}** plan, free for ${o.trialDays} days. Everything is unlocked.` },
        {
          type: "details",
          rows: [
            ["Plan", o.planName],
            ["Trial ends", ends ?? "—"],
            ["First payment", o.firstCharge ? `${o.firstCharge} on ${ends}` : (ends ?? "After the trial")],
          ],
        },
        { type: "callout", tone: "success", text: `Not for you? **Cancel before ${ends ?? "the trial ends"}** from your account and you won't be charged anything.` },
      ],
      button: o.appReady ? { label: "Open Maa One", href: o.appUrl } : { label: "Go to my account", href: `${b.siteUrl}/account` },
      secondary: { label: "Manage my subscription", href: `${b.siteUrl}/account/subscription` },
      reason: "You're receiving this because you started a Maa One subscription.",
    },
    b,
  );
}

export function paymentReceivedEmail(
  b: Brand,
  o: { first: boolean; amount: string; invoiceNumber: string; planName: string; period: string; paidOn: string; nextDate?: string | null; appUrl: string; appReady: boolean },
) {
  return make(
    o.first ? `Welcome aboard — payment received (${o.invoiceNumber})` : `Payment received — invoice ${o.invoiceNumber}`,
    {
      preheader: `${o.amount} received. Your GST invoice is attached.`,
      eyebrow: "Payment received",
      heading: o.first ? "Thank you — you're all set!" : "Payment received, thank you",
      blocks: [
        { type: "p", text: o.first ? "Your subscription is active. Your GST invoice is attached to this email and is always available in your account." : "We've received your payment. Your GST invoice is attached and saved in your account." },
        {
          type: "details",
          rows: [
            ["Amount paid", `**${o.amount}**`],
            ["Invoice", o.invoiceNumber],
            ["Plan", `${o.planName} · ${o.period}`],
            ["Paid on", o.paidOn],
            ...(o.nextDate ? ([["Next payment", o.nextDate]] as [string, string][]) : []),
          ],
        },
      ],
      button: o.appReady ? { label: "Open Maa One", href: o.appUrl } : { label: "View my invoices", href: `${b.siteUrl}/account/invoices` },
      secondary: o.appReady ? { label: "View my invoices", href: `${b.siteUrl}/account/invoices` } : undefined,
      reason: "You're receiving this because you made a payment for Maa One.",
    },
    b,
  );
}

export function paymentFailedEmail(b: Brand) {
  return make(
    "Action needed: your Maa One payment didn't go through",
    {
      preheader: "Please check your card or UPI mandate to keep your plan active.",
      eyebrow: "Payment failed",
      heading: "Your payment didn't go through",
      blocks: [
        { type: "p", text: "We couldn't collect your latest subscription payment. Razorpay will **retry automatically** over the next few days." },
        { type: "callout", tone: "warning", text: "Please check that your card or UPI autopay mandate is active and has enough balance. If payments keep failing, your subscription will be paused." },
      ],
      button: { label: "Check my subscription", href: `${b.siteUrl}/account/subscription` },
      reason: "You're receiving this because a payment for your Maa One subscription failed.",
    },
    b,
  );
}

export function renewalReminderEmail(b: Brand, o: { planName: string; amount: string; date: string }) {
  return make(
    `Your Maa One plan renews on ${o.date}`,
    {
      preheader: `${o.planName} renews for ${o.amount} including GST.`,
      eyebrow: "Renewal reminder",
      heading: `Your plan renews on ${o.date}`,
      blocks: [
        { type: "details", rows: [["Plan", o.planName], ["Renews on", o.date], ["Amount", `${o.amount} incl. GST`]] },
        { type: "p", text: "Nothing to do if you'd like to continue — the payment is taken automatically. To change or cancel your plan, visit your account before then." },
      ],
      button: { label: "Manage my plan", href: `${b.siteUrl}/account/subscription` },
      reason: "You're receiving this because your Maa One subscription renews soon.",
    },
    b,
  );
}

export function planChangedEmail(b: Brand, o: { from: string; to: string; period: string; when: "now" | "renewal"; date?: string | null }) {
  const now = o.when === "now";
  return make(
    now ? `You're now on Maa One ${o.to}` : `Your switch to ${o.to} is scheduled`,
    {
      preheader: now ? `Your plan changed from ${o.from} to ${o.to}.` : `${o.to} starts at your next renewal.`,
      eyebrow: "Plan change",
      heading: now ? `Upgraded to ${o.to}` : `${o.to} starts at your next renewal`,
      blocks: [
        { type: "details", rows: [["Previous plan", o.from], ["New plan", `**${o.to}** · ${o.period}`], ["Takes effect", now ? "Now" : (o.date ?? "At your next renewal")]] },
        {
          type: "callout",
          tone: now ? "success" : "info",
          text: now ? "The new features are unlocked now. Razorpay adjusts the charge for the rest of this period, and your next invoice shows it." : "You keep your current plan until then. Nothing else to do.",
        },
      ],
      button: { label: "View my subscription", href: `${b.siteUrl}/account/subscription` },
      reason: "You're receiving this because your Maa One plan was changed.",
    },
    b,
  );
}

export function cancelledEmail(b: Brand, o: { endsAt: string | null; scheduled: boolean }) {
  const ends = istDate(o.endsAt);
  const ended = !o.scheduled && (!o.endsAt || new Date(o.endsAt).getTime() <= Date.now());
  return make(
    o.scheduled ? "Your Maa One cancellation is confirmed" : "Your Maa One subscription has ended",
    {
      preheader: o.scheduled && ends ? `You keep access until ${ends}.` : "You won't be charged again.",
      eyebrow: "Subscription",
      heading: o.scheduled ? "Cancellation confirmed" : ended ? "Your subscription has ended" : "Your subscription is cancelled",
      blocks: [
        {
          type: "p",
          text: o.scheduled && ends ? `You can keep using Maa One until **${ends}**. You won't be charged again.` : "You won't be charged again. Your invoices stay available in your account.",
        },
        { type: "callout", tone: "info", text: "Changed your mind? You can start again any time from your account — your details are saved." },
        { type: "p", text: "We'd really like to know what we could do better. Just reply to this email — Naveen reads every reply." },
      ],
      button: { label: "Go to my account", href: `${b.siteUrl}/account` },
      reason: "You're receiving this because your Maa One subscription was cancelled.",
    },
    b,
  );
}

export function refundRequestedEmail(b: Brand, o: { invoiceNumber: string; amount: string; reason: string }) {
  return make(
    `We've received your refund request (${o.invoiceNumber})`,
    {
      preheader: "We'll reply within 2 working days.",
      eyebrow: "Refund request",
      heading: "We've received your refund request",
      blocks: [
        { type: "details", rows: [["Invoice", o.invoiceNumber], ["Amount", o.amount], ["Status", "Under review"]] },
        { type: "quote", label: "Your reason", text: o.reason },
        { type: "p", text: "We'll review it and reply within **2 working days**. If it's approved, the money goes back to your original payment method within 5–7 working days." },
      ],
      button: { label: "Track it in my account", href: `${b.siteUrl}/account/support` },
      secondary: { label: "Read the refund policy", href: `${b.siteUrl}/refund-policy` },
      reason: "You're receiving this because you asked for a refund on your Maa One account.",
    },
    b,
  );
}

export function ticketReceivedEmail(b: Brand, o: { subject: string }) {
  return make(
    `We've got your message: ${o.subject}`,
    {
      preheader: "We usually reply within one working day.",
      eyebrow: "Support",
      heading: "We've got your message",
      blocks: [
        { type: "details", rows: [["Subject", o.subject], ["Status", "Open"]] },
        { type: "p", text: "We usually reply within **one working day**. You'll get an email when we do, and the reply also shows in your account." },
      ],
      button: { label: "View my support requests", href: `${b.siteUrl}/account/support` },
      reason: "You're receiving this because you contacted Maa One support.",
    },
    b,
  );
}

export function supportReplyEmail(b: Brand, o: { subject: string; reply: string; closed: boolean }) {
  return make(
    `Re: ${o.subject}`,
    {
      preheader: o.reply.slice(0, 90),
      eyebrow: "Support reply",
      heading: "We've replied to your request",
      blocks: [
        { type: "quote", label: "Our reply", text: o.reply },
        { type: "p", text: o.closed ? "We've marked this request as resolved. If something's still not right, just reply to this email." : "Reply to this email or open your account if you need anything else." },
      ],
      button: { label: "Open my support requests", href: `${b.siteUrl}/account/support` },
      reason: `You're receiving this because you asked Maa One support about “${o.subject}”.`,
    },
    b,
  );
}

export function contactReceivedEmail(b: Brand, o: { name: string }) {
  return make(
    "Thanks for getting in touch with Maa One",
    {
      preheader: "We'll get back to you within one working day.",
      eyebrow: "Message received",
      heading: `Thanks, ${firstName(o.name)}!`,
      blocks: [
        { type: "p", text: "We've received your message and will get back to you within **one working day**." },
        { type: "callout", tone: "info", text: `In a hurry? WhatsApp us on **${b.whatsappDisplay}** — we usually reply within the hour during working hours.` },
      ],
      button: { label: "Chat on WhatsApp", href: b.whatsappLink },
      secondary: { label: "See how Maa One works", href: `${b.siteUrl}/#demo` },
      reason: "You're receiving this because you sent us a message on one.maalabs.in.",
    },
    b,
  );
}

/* ------------------------------------------------------------------ */
/* Alerts to the Maa Labs team                                         */
/* ------------------------------------------------------------------ */

export function adminAlertEmail(b: Brand, o: { subject: string; heading: string; rows: [string, string][]; message?: { label: string; text: string }; link: { label: string; href: string } }) {
  return make(
    `[Maa One] ${o.subject}`,
    {
      preheader: o.heading,
      eyebrow: "Admin alert",
      heading: o.heading,
      blocks: [{ type: "details", rows: o.rows }, ...(o.message ? [{ type: "quote" as const, label: o.message.label, text: o.message.text }] : [])],
      button: o.link,
      reason: "Sent to the Maa One admin team.",
      internal: true,
    },
    b,
  );
}

/* ------------------------------------------------------------------ */
/* Supabase Auth templates (paste into Supabase → Auth → Email templates) */
/* ------------------------------------------------------------------ */

export function authTemplates(b: Brand) {
  const otp = (heading: string, intro: string, reason: string) =>
    render(
      {
        preheader: "Your Maa One login code is inside. It expires in 1 hour.",
        eyebrow: "Login code",
        heading,
        blocks: [
          { type: "p", text: intro },
          { type: "code", value: "{{ .Token }}", note: "Enter this code on the Maa One login page. It expires in 1 hour." },
          { type: "callout", tone: "warning", text: "**Never share this code.** Maa One staff will never ask you for it. If you didn't try to log in, you can ignore this email." },
        ],
        reason,
      },
      b,
    ).html;
  return [
    {
      key: "magic-link",
      supabaseName: "Magic Link",
      subject: "Your Maa One login code: {{ .Token }}",
      html: otp("Your login code", "Use this code to log in to Maa One:", "You're receiving this because someone asked to log in to Maa One with this email address."),
    },
    {
      key: "confirm-signup",
      supabaseName: "Confirm signup",
      subject: "Your Maa One sign-up code: {{ .Token }}",
      html: otp("Welcome! Confirm your email", "Use this code to finish creating your Maa One account:", "You're receiving this because this email address was used to sign up for Maa One."),
    },
    {
      key: "change-email",
      supabaseName: "Change Email Address",
      subject: "Confirm your new Maa One email address",
      html: render(
        {
          preheader: "Confirm the change to your login email.",
          eyebrow: "Account security",
          heading: "Confirm your new email address",
          blocks: [
            { type: "p", text: "You asked to change your Maa One login email to **{{ .NewEmail }}**. Enter this code, or use the button below:" },
            { type: "code", value: "{{ .Token }}" },
            { type: "callout", tone: "warning", text: "Didn't ask for this? Ignore this email and your login email stays the same. Then write to us so we can check your account." },
          ],
          button: { label: "Confirm new email", href: "{{ .ConfirmationURL }}" },
          reason: "You're receiving this because a change of login email was requested on your Maa One account.",
        },
        b,
      ).html,
    },
    {
      key: "reauthentication",
      supabaseName: "Reauthentication",
      subject: "Your Maa One security code: {{ .Token }}",
      html: otp("Confirm it's you", "Use this code to confirm a sensitive change on your Maa One account:", "You're receiving this because a security check was requested on your Maa One account."),
    },
  ];
}
