import { after, NextResponse } from "next/server";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { validateTicket } from "@/lib/validation";
import { getBrand, sendEmail } from "@/lib/email";
import { ticketReceivedEmail } from "@/lib/email-templates";
import { sendAdminAlert } from "@/lib/billing";
import { site } from "@/site.config";

export async function POST(req: Request) {
  const { user, supabase, response } = await requireUser();
  if (!user) return response;
  const body = await readJson(req);
  if (!body) return badRequest();
  const { ok, errors, data } = validateTicket(body);
  if (!ok) return invalid(errors);
  const { error } = await supabase.from("support_tickets").insert(data);
  if (error) return serverError("support_tickets", error);
  after(async () => {
    await sendEmail(user.email, ticketReceivedEmail(await getBrand(), { subject: data.subject }));
    await sendAdminAlert(
      {
        subject: `Support: ${data.subject}`,
        heading: "New support request",
        rows: [
          ["From", user.email ?? user.phone ?? user.id],
          ["Subject", data.subject],
        ],
        message: { label: "Message", text: data.message },
        link: { label: "Open support tickets", href: `${site.url}/admin/support` },
      },
      user.email ?? undefined,
    );
  });
  return NextResponse.json({ ok: true });
}
