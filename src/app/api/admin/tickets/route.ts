import { redirectTo } from "@/lib/redirect";
import { after, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getBrand, sendEmail } from "@/lib/email";
import { supportReplyEmail } from "@/lib/email-templates";
import { emailForUser } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

/** Admin reply to a support ticket (RLS allows only admins to update). */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });

  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "answered");
  const reply = String(form.get("admin_reply") ?? "").trim().slice(0, 5000);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["open", "answered", "closed"].includes(status)) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const { data: ticket, error } = await auth.supabase
    .from("support_tickets")
    .update({ status, admin_reply: reply || null })
    .eq("id", id)
    .select("user_id, subject")
    .maybeSingle();
  if (error) {
    console.error("[admin tickets]", error);
    return new NextResponse("Couldn't save reply", { status: 500 });
  }
  if (ticket && reply) {
    after(async () => {
      const to = await emailForUser(createAdminClient(), ticket.user_id);
      await sendEmail(to, supportReplyEmail(await getBrand(), { subject: ticket.subject, reply, closed: status === "closed" }));
    });
  }
  return redirectTo("/admin/support", 303);
}
