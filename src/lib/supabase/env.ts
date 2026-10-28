/**
 * Supabase clients need the bare project URL. Strip any path (e.g. a pasted
 * ".../rest/v1/"), otherwise auth calls fail with "Invalid path specified in request URL".
 */
function projectUrl(raw: string | undefined) {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

export const SUPABASE_URL = projectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
