import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";
import { indianStates } from "@/lib/states";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Saves site_settings (admins only; RLS allows admins to update `value`). Changes show on the site at once. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });
  const b = await readJson(req);
  if (!b) return badRequest();

  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const n = (k: string) => Number(b[k]);
  const values: Record<string, unknown> = {
    sales_open: b.sales_open === true,
    launch_date: s("launch_date"),
    trial_days: n("trial_days"),
    gst_rate: n("gst_rate"),
    company_state: s("company_state"),
    support_email: s("support_email").toLowerCase(),
    naveencodes_email: s("naveencodes_email").toLowerCase(),
    whatsapp: s("whatsapp").replace(/[^\d+]/g, ""),
    instagram: s("instagram").replace(/^@/, ""),
    app_url: s("app_url").replace(/\/+$/, ""),
  };

  const errors: Record<string, string> = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.launch_date as string) || Number.isNaN(Date.parse(values.launch_date as string)))
    errors.launch_date = "Pick a valid date.";
  if (!Number.isInteger(values.trial_days) || (values.trial_days as number) < 0 || (values.trial_days as number) > 90)
    errors.trial_days = "Use a whole number of days between 0 and 90.";
  if (!Number.isFinite(values.gst_rate) || (values.gst_rate as number) < 0 || (values.gst_rate as number) > 28)
    errors.gst_rate = "Use a GST rate between 0 and 28.";
  if (!indianStates.includes(values.company_state as string)) errors.company_state = "Choose a state.";
  if (!EMAIL.test(values.support_email as string)) errors.support_email = "Enter a valid email.";
  if (!EMAIL.test(values.naveencodes_email as string)) errors.naveencodes_email = "Enter a valid email.";
  if (!/^\+\d{10,15}$/.test(values.whatsapp as string)) errors.whatsapp = "Use international format, e.g. +918053385815.";
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(values.instagram as string)) errors.instagram = "Enter an Instagram handle.";
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(values.app_url as string)) errors.app_url = "Enter a full https:// address.";
  if (Object.keys(errors).length) return invalid(errors);

  for (const [key, value] of Object.entries(values)) {
    const { error } = await auth.supabase.from("site_settings").update({ value }).eq("key", key);
    if (error) return serverError("admin settings", error);
  }
  revalidateTag("site_settings");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
