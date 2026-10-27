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
