import { NextResponse } from "next/server";
import { adminTables, isAdminTable, requireAdmin } from "@/lib/admin";

/** Changes the status of a waitlist entry, feature request, contact message or ticket (admins only). */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });

  const form = await req.formData();
  const list = String(form.get("list") ?? "");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const back = String(form.get("back") ?? "");
  if (!isAdminTable(list) || !/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Invalid request", { status: 400 });
  const def = adminTables[list];
  if (!(def.statuses as readonly string[]).includes(status)) return new NextResponse("Invalid status", { status: 400 });

  const update: Record<string, unknown> = { status };
  if (list === "waitlist" && status === "invited") update.invited_at = new Date().toISOString();
  const { error } = await auth.supabase.from(def.table).update(update).eq("id", id);
  if (error) {
    console.error("[admin status]", error);
    return new NextResponse("Couldn't update", { status: 500 });
  }
  const target = back.startsWith("/admin") && !back.startsWith("//") ? back : `/admin/${list}`;
  return NextResponse.redirect(new URL(target, req.url), { status: 303 });
}
