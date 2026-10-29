import { after, NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson, verifyHuman, serverError } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getBrand, sendEmail } from "@/lib/email";
import { contactReceivedEmail } from "@/lib/email-templates";
import { sendAdminAlert } from "@/lib/billing";
import { site } from "@/site.config";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors, data } = validateContact(body);
  if (!ok) return invalid(errors);
  const notHuman = await verifyHuman(body, req);
  if (notHuman) return notHuman;
  if (!supabaseConfigured) return NextResponse.json({ ok: true, preview: true });

  const { error } = await createAnonClient()
    .from("contact_messages")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.topic ? `[${data.topic}] ${data.message}` : data.message,
    });
  if (error) return serverError("contact_messages", error);

  after(async () => {
    await sendEmail(data.email, contactReceivedEmail(await getBrand(), { name: data.name }));
    await sendAdminAlert(
      {
        subject: `Contact form: ${data.name}`,
        heading: "New message from the contact form",
        rows: [
          ["Name", data.name],
          ["Email", data.email],
          ["Phone", data.phone || "—"],
          ["Topic", data.topic || "—"],
        ],
        message: { label: "Message", text: data.message },
        link: { label: "Open contact messages", href: `${site.url}/admin/contact` },
      },
      data.email,
    );
  });
  return NextResponse.json({ ok: true });
}
