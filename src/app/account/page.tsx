import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonClass } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const [supabase, cfg] = await Promise.all([createClient(), getSettings()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

  return (
    <section className="container-page max-w-3xl py-14 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">My account</h1>
          <p className="mt-1 text-muted">{user.email ?? user.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={cfg.appUrl} className={buttonClass("primary")}>
            Open Maa One <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          {profile?.is_admin && (
            <Link href="/admin" className={buttonClass("secondary")}>
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className={buttonClass("secondary")}>
              Log out
            </button>
          </form>
        </div>
      </div>
      <div className="card mt-8 p-6">
        <h2 className="font-semibold text-ink">My plan, invoices and billing</h2>
        <p className="mt-2 text-muted">
          Your plan, GST invoices and billing details will appear here once subscriptions open at
          launch.
        </p>
      </div>
    </section>
  );
}
