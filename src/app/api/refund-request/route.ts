import { after, NextResponse } from "next/server";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { sendAdminAlert } from "@/lib/billing";
import { getBrand, sendEmail } from "@/lib/email";
import { refundRequestedEmail } from "@/lib/email-templates";
import { formatMoney } from "@/lib/format";
import { site } from "@/site.config";

/**
 * Refund request for one of the user's own invoices. Saved as a support ticket
 * (subject "Refund request · <invoice>"), so the team handles it in /admin/support.
 */
export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();

  const invoiceId = String(body.invoice_id ?? "");
  const reason = String(body.reason ?? "").trim().slice(0, 2000);
  if (!/^[0-9a-f-]{36}$/i.test(invoiceId)) return badRequest();
  if (reason.length < 10) return invalid({ reason: "Please tell us a little more (at least 10 characters)." });

  // RLS returns the invoice only if it belongs to this user.
  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, total, currency, status")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!invoice || invoice.status === "cancelled") return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });

  const subject = `Refund request · ${invoice.invoice_number}`;
  const { data: existing } = await supabase.from("support_tickets").select("id").eq("user_id", user.id).eq("subject", subject).neq("status", "closed").limit(1);
  if (existing?.length) return NextResponse.json({ ok: false, error: "You've already asked for a refund on this invoice. We'll reply soon." }, { status: 409 });

  const amount = formatMoney(invoice.total, invoice.currency);
  const { error } = await supabase.from("support_tickets").insert({ subject, message: `Refund requested for ${invoice.invoice_number} (${amount}).\n\nReason: ${reason}` });
  if (error) return serverError("refund request", error);

  after(async () => {
    await sendEmail(user.email, refundRequestedEmail(await getBrand(), { invoiceNumber: invoice.invoice_number, amount, reason }));
    await sendAdminAlert(
      {
        subject: `Refund request: ${invoice.invoice_number} (${amount})`,
        heading: "A customer asked for a refund",
        rows: [
          ["Customer", user.email ?? user.phone ?? user.id],
          ["Invoice", invoice.invoice_number],
          ["Amount", amount],
        ],
        message: { label: "Reason", text: reason },
        link: { label: "Open support tickets", href: `${site.url}/admin/support` },
      },
      user.email ?? undefined,
    );
  });
  return NextResponse.json({ ok: true });
}
