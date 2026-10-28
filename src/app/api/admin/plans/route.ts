import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { badRequest, invalid, readJson, serverError } from "@/lib/api";

const rupees = (v: unknown) => Math.round(Number(v) * 100);

/** Saves one plan (admins only). Prices arrive in rupees/dollars and are stored in paise/cents. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });
  const b = await readJson(req);
  if (!b) return badRequest();

  const code = typeof b.code === "string" ? b.code : "";
  if (!/^[a-z][a-z0-9_]{1,30}$/.test(code)) return badRequest();
  const str = (k: string, max: number) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");
  const optInt = (k: string) => (b[k] === "" || b[k] === null || b[k] === undefined ? null : Number(b[k]));
  const rzp = (k: string) => {
    const v = str(k, 40);
    return v || null;
  };

  const row = {
    name: str("name", 40),
    tagline: str("tagline", 120) || null,
    price_inr_monthly: rupees(b.price_inr_monthly),
    price_inr_yearly: rupees(b.price_inr_yearly),
    price_usd_monthly: rupees(b.price_usd_monthly),
    price_usd_yearly: rupees(b.price_usd_yearly),
    max_users: optInt("max_users"),
    max_businesses: Number(b.max_businesses),
    features: (Array.isArray(b.features) ? b.features : []).map((f) => String(f).trim().slice(0, 80)).filter(Boolean).slice(0, 12),
    is_popular: b.is_popular === true,
    is_active: b.is_active === true,
    razorpay_plan_id_monthly: rzp("razorpay_plan_id_monthly"),
    razorpay_plan_id_yearly: rzp("razorpay_plan_id_yearly"),
  };

  const errors: Record<string, string> = {};
  if (row.name.length < 2) errors.name = "Enter a plan name.";
  for (const k of ["price_inr_monthly", "price_inr_yearly", "price_usd_monthly", "price_usd_yearly"] as const)
    if (!Number.isInteger(row[k]) || row[k] < 0) errors[k] = "Enter a price of 0 or more.";
  if (row.max_users !== null && (!Number.isInteger(row.max_users) || row.max_users < 1)) errors.max_users = "Whole number, or leave blank for no limit.";
  if (!Number.isInteger(row.max_businesses) || row.max_businesses < 1) errors.max_businesses = "At least 1.";
  for (const k of ["razorpay_plan_id_monthly", "razorpay_plan_id_yearly"] as const)
    if (row[k] && !/^plan_[A-Za-z0-9]+$/.test(row[k]!)) errors[k] = "Razorpay plan IDs start with plan_.";
  if (Object.keys(errors).length) return invalid(errors);

  const { error } = await auth.supabase.from("plans").update(row).eq("code", code);
  if (error) return serverError("admin plans", error);
  revalidateTag("plans");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
