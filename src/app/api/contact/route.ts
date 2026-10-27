import { NextResponse } from "next/server";
import { badRequest, invalid, isBot, readJson, serverError } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import { createAnonClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badRequest();
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { ok, errors, data } = validateContact(body);
  if (!ok) return invalid(errors);
  if (!supabaseConfigured) return NextResponse.json({ ok: true, preview: true });

  const { error } = await createAnonClient()
    .from("contact_messages")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.topic ? `[${data.topic}] ${data.message}` : data.message,
    });
  if (error) return serverError("contact_messages", error);

  return NextResponse.json({ ok: true });
}
