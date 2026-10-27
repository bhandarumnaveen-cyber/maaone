import "server-only";
import { site } from "@/site.config";

type Attachment = { filename: string; content: Uint8Array };

/** Sends through Resend. Without RESEND_API_KEY it logs and skips, so flows keep working. */
export async function sendEmail(opts: { to: string; subject: string; html: string; attachments?: Attachment[] }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email skipped: no RESEND_API_KEY] ${opts.subject} → ${opts.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${site.name} <hello@maalabs.in>`,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        attachments: opts.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content).toString("base64"),
        })),
      }),
    });
    if (!res.ok) console.error("[email]", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[email]", e);
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Simple branded HTML email. `paragraphs` are plain text and get escaped. */
export function emailLayout(opts: {
  heading: string;
  paragraphs: string[];
  button?: { label: string; href: string };
  supportEmail: string;
}) {
  const p = opts.paragraphs
    .map((t) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155">${esc(t)}</p>`)
    .join("");
  const button = opts.button
    ? `<p style="margin:22px 0"><a href="${esc(opts.button.href)}" style="background:#3730A3;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;display:inline-block">${esc(opts.button.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#FAFAF9;font-family:Inter,Segoe UI,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 24px">Maa <span style="color:#3730A3">One</span></p>
<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px">
<h1 style="font-size:22px;color:#0f172a;margin:0 0 16px">${esc(opts.heading)}</h1>${p}${button}
</div>
<p style="font-size:12px;color:#64748b;margin:20px 0 0;line-height:1.6">${esc(site.creditLine)}<br>${esc(site.company)} · Questions? ${esc(opts.supportEmail)}</p>
</div></body></html>`;
}
