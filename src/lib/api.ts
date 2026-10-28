import { NextResponse } from "next/server";
import type { FieldErrors } from "./validation";

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Honeypot: bots fill the hidden "website" field, people never see it. */
export function isBot(body: Record<string, unknown>) {
  return typeof body.website === "string" && body.website.length > 0;
}

export function invalid(errors: FieldErrors) {
  return NextResponse.json({ ok: false, errors }, { status: 422 });
}

export function badRequest() {
  return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
}

export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
  return NextResponse.json(
    { ok: false, error: "We couldn't save that just now. Please try again in a minute." },
    { status: 500 },
  );
}

/**
 * Cloudflare Turnstile check. Passes when TURNSTILE_SECRET_KEY isn't set (protection off).
 * Returns a 400 response to send back when the check fails.
 */
export async function verifyHuman(body: Record<string, unknown>, req: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return null;
  const token = typeof body["cf-turnstile-response"] === "string" ? (body["cf-turnstile-response"] as string) : "";
  const fail = NextResponse.json({ ok: false, error: "Please complete the security check and try again." }, { status: 400 });
  if (!token) return fail;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
      }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success ? null : fail;
  } catch (e) {
    console.error("[turnstile]", e);
    return fail;
  }
}
