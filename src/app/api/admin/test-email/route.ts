import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { readJson } from "@/lib/api";
import { getBrand, sendEmail } from "@/lib/email";
import { sampleEmails } from "@/lib/email-samples";
import { getSettings } from "@/lib/settings";

/** Sends one sample email to the logged-in admin (admins only). */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });
  const body = await readJson(req);
  const [brand, settings] = await Promise.all([getBrand(), getSettings()]);
  const sample = sampleEmails(brand, settings).find((e) => e.key === body?.key);
  if (!sample || !auth.user.email) return NextResponse.json({ ok: false }, { status: 400 });
  const ok = await sendEmail(auth.user.email, { ...sample.email, subject: `[Test] ${sample.email.subject}` });
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
