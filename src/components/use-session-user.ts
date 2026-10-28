"use client";

import { useEffect, useState } from "react";
import { supabaseConfigured } from "@/lib/supabase/env";

export type SessionUser = { name: string; detail: string; isAdmin: boolean };

/** Supabase stores the session in an "sb-<project>-auth-token" cookie (possibly chunked). */
const hasSessionCookie = () => typeof document !== "undefined" && /(?:^|;\s*)sb-[^=]+-auth-token/.test(document.cookie);

/**
 * The logged-in user for the marketing header; null while logged out or loading.
 * Visitors without a session cookie never download the Supabase client.
 */
export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (!supabaseConfigured || !hasSessionCookie()) return;
    let alive = true;
    let unsubscribe = () => {};

    import("@/lib/supabase/client").then(({ createClient }) => {
      if (!alive) return;
      const supabase = createClient();
      const load = async () => {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (!alive) return;
        if (!u) return setUser(null);
        const { data: p } = await supabase.from("profiles").select("full_name, is_admin").eq("id", u.id).maybeSingle();
        if (!alive) return;
        const detail = u.email ?? u.phone ?? "";
        setUser({ name: p?.full_name || detail.split("@")[0] || "My account", detail, isAdmin: Boolean(p?.is_admin) });
      };
      load();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") setUser(null);
        else if (event === "SIGNED_IN" || event === "USER_UPDATED") load();
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return user;
}
