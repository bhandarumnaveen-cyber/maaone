import { NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson, verifyHuman, serverError } from "@/lib/api";
import { validateFeatureRequest } from "@/lib/validation";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors, data } = validateFeatureRequest(body);
  if (!ok) return invalid(errors);
  const notHuman = await verifyHuman(body, req);
  if (notHuman) return notHuman;
  if (!supabaseConfigured) return NextResponse.json({ ok: true, preview: true });

  const { error } = await createAnonClient()
    .from("feature_requests")
    .insert({ name: data.name || null, email: data.email || null, request: data.request });
  if (error) return serverError("feature_requests", error);

  return NextResponse.json({ ok: true });
}
