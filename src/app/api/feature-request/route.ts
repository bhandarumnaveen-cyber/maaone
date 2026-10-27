import { NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson } from "@/lib/api";
import { validateFeatureRequest } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors } = validateFeatureRequest(body);
  if (!ok) return invalid(errors);

  // Phase 2: save to Supabase and send the confirmation email here.
  // Until then the submission is validated but not stored.
  return NextResponse.json({ ok: true, preview: true });
}
