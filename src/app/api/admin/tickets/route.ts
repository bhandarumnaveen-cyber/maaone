import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

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

  const { error } = await auth.supabase
    .from("support_tickets")
    .update({ status, admin_reply: reply || null })
    .eq("id", id);
  if (error) {
    console.error("[admin tickets]", error);
    return new NextResponse("Couldn't save reply", { status: 500 });
  }
  return NextResponse.redirect(new URL("/admin?tab=support", req.url), { status: 303 });
}
